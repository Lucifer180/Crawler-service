import { Page } from "playwright";
import { ProductDetails } from "../../types/ProductDetails";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { FlipkartDetailsSelectors } from "./flipkartDetailsSelectors";

export class FlipkartDetailsParser {
    static async parse(page: Page): Promise<ProductDetails> {

        const data = await page.evaluate((selectors) => {

            const text = (selector: string): string =>
                document.querySelector(selector)?.textContent?.trim() ?? "";

            const elements = (selector: string): Element[] =>
                Array.from(document.querySelectorAll(selector));

            // ── JSON-LD ───────────────────────────────────────────────────────
            // Flipkart ships a schema.org Product block on both the desktop PDP
            // and the "fk-lite" layout. The lite layout's class names are
            // generated atomic CSS, so JSON-LD is the only stable source there.
            const readJsonLd = (): any => {
                const scripts = elements('script[type="application/ld+json"]');

                for (const script of scripts) {
                    try {
                        const parsed = JSON.parse(script.textContent ?? "");

                        const candidates = Array.isArray(parsed) ? parsed : [parsed];

                        const product = candidates.find(
                            (node: any) => node && node["@type"] === "Product"
                        );

                        if (product) return product;
                    } catch {
                        // malformed block — try the next one
                    }
                }

                return null;
            };

            const ld = readJsonLd();

            const meta = (property: string): string =>
                document
                    .querySelector(`meta[property="${property}"], meta[name="${property}"]`)
                    ?.getAttribute("content")
                    ?.trim() ?? "";

            // ── Title ─────────────────────────────────────────────────────────
            const title =
                text(selectors.TITLE) ||
                ld?.name ||
                meta("og:title") ||
                "";

            // ── Brand ─────────────────────────────────────────────────────────
            const ldBrand =
                typeof ld?.brand === "string" ? ld.brand : ld?.brand?.name ?? "";

            const brand =
                text(selectors.BRAND) ||
                ldBrand ||
                title.split(" ")[0] ||
                "";

            // ── Price ─────────────────────────────────────────────────────────
            const domPriceText = text(selectors.PRICE);

            const ldPrice = Number(ld?.offers?.price ?? ld?.offers?.[0]?.price ?? 0);

            const priceText = domPriceText || (ldPrice ? String(ldPrice) : "");

            // ── Rating ────────────────────────────────────────────────────────
            const ratingText = text(selectors.RATING);

            const rating =
                parseFloat(ratingText) ||
                Number(ld?.aggregateRating?.ratingValue) ||
                0;

            // "1,234 Ratings & 56 Reviews" → 1234
            const ratingCountText = text(selectors.RATING_COUNT);

            const domRatingCount = Number(
                (ratingCountText.match(/([\d,]+)\s*Ratings?/i)?.[1] ?? "").replace(/,/g, "")
            );

            const ratingCount =
                domRatingCount ||
                Number(ld?.aggregateRating?.ratingCount) ||
                Number(ld?.aggregateRating?.reviewCount) ||
                0;

            // ── Images ────────────────────────────────────────────────────────
            const ldImages: string[] = Array.isArray(ld?.image)
                ? ld.image
                : ld?.image
                    ? [ld.image]
                    : [];

            const imageUrls = (selector: string): string[] =>
                elements(selector)
                    .map(el => el.getAttribute("src") ?? el.getAttribute("data-src") ?? "")
                    .filter(Boolean);

            const domImages = imageUrls(
                `${selectors.MAIN_IMAGE}, ${selectors.THUMBNAILS}`
            );

            // Last resort only: this catch-all also matches banners and
            // recommendation carousels, so never mix it with the good sources.
            const images = ldImages.length || domImages.length
                ? Array.from(new Set([...ldImages, ...domImages]))
                : Array.from(new Set(imageUrls(selectors.ANY_PRODUCT_IMAGE)));

            const image = images[0] ?? meta("og:image");

            // ── Description ───────────────────────────────────────────────────
            // Prefer the "Highlights" bullets, fall back to the description
            // block, then to the JSON-LD blurb.
            const description: string[] = elements(selectors.HIGHLIGHTS)
                .map(el => el.textContent?.trim() ?? "")
                .filter(Boolean);

            if (!description.length) {
                elements(selectors.DESCRIPTION).forEach(container => {
                    const raw = container.textContent?.trim() ?? "";

                    raw.split(/\n+/)
                        .map(line => line.trim())
                        .filter(Boolean)
                        .forEach(line => description.push(line));
                });
            }

            if (!description.length && ld?.description) {
                description.push(String(ld.description).trim());
            }

            // ── Sizes ─────────────────────────────────────────────────────────
            const sizes = Array.from(
                new Set(
                    elements(selectors.SIZE_OPTIONS)
                        .map(el => el.textContent?.trim() ?? "")
                        .filter(Boolean)
                )
            );

            // ── Colors ────────────────────────────────────────────────────────
            const domColors = elements(selectors.COLOR_OPTIONS)
                .map(el => (el.getAttribute("alt") || el.getAttribute("title") || "").trim())
                .filter(Boolean);

            const colors = Array.from(
                new Set([...(ld?.color ? [String(ld.color)] : []), ...domColors])
            );

            // ── Specifications ────────────────────────────────────────────────
            const specifications: Record<string, string> = {};

            elements(selectors.SPECIFICATION_ROWS).forEach(row => {
                const cells = Array.from(row.children);

                if (cells.length < 2) return;

                const key = cells[0].textContent?.trim() ?? "";
                const value = cells[1].textContent?.trim() ?? "";

                if (key && value) specifications[key] = value;
            });

            // ── Availability ──────────────────────────────────────────────────
            const ldAvailability = String(ld?.offers?.availability ?? "");

            const soldOut =
                !!document.querySelector(selectors.OUT_OF_STOCK) ||
                /OUT OF STOCK|SOLD OUT|CURRENTLY UNAVAILABLE/i.test(
                    document.body.textContent ?? ""
                );

            const availability = ldAvailability
                ? /InStock/i.test(ldAvailability) && !soldOut
                : !soldOut;

            return {
                title,
                brand,
                priceText,
                rating,
                ratingCount,
                image,
                images,
                sizes,
                description,
                colors,
                specifications,
                availability
            };

        }, FlipkartDetailsSelectors);

        return {
            id: crypto.randomUUID(),

            title: data.title,

            brand: data.brand,

            description: data.description,

            price: normalizePrice(data.priceText),

            image: data.image,

            images: data.images,

            rating: data.rating,

            ratingCount: data.ratingCount,

            sizes: data.sizes,

            colors: data.colors,

            specifications: data.specifications,

            availability: data.availability,

            platform: "flipkart",

            url: page.url()
        };
    }
}
