import { Page } from "playwright";
import { ProductDetails } from "../../types/ProductDetails";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { MyntraDetailsSelectors } from "./MyntraDetailsSelector";

export class MyntraDetailsParser {
    static async parse(page: Page): Promise<ProductDetails> {
        await page.screenshot({
            path: 'myntra-debug.png',
            fullPage: true
        });

        const title =
            await page.locator(MyntraDetailsSelectors.SUBTITLE).textContent().catch(() => "") ?? "";

        const brand =
            await page.locator(MyntraDetailsSelectors.TITLE).textContent().catch(() => "") ?? "";

        const priceText =
            await page.locator(MyntraDetailsSelectors.PRICE).textContent().catch(() => "") ?? "";

        // ── Rating ────────────────────────────────────────────────────────────
        const ratingText = await page
            .locator(MyntraDetailsSelectors.RATING)
            .first()
            .textContent()
            .catch(() => "0") ?? "0";

        const rating = parseFloat(ratingText.trim() || "0");

        // Rating count — handles "1.3k Ratings", "179 Ratings", etc.
        const ratingCountText = await page
            .locator(MyntraDetailsSelectors.RATING_COUNT)
            .textContent()
            .catch(() => "0") ?? "0";

        const ratingCountRaw = ratingCountText.trim().replace(/ratings?/i, "").trim();
        const ratingCount = ratingCountRaw.toLowerCase().endsWith("k")
            ? Math.round(parseFloat(ratingCountRaw) * 1000)
            : parseInt(ratingCountRaw, 10) || 0;

        // ── Images ────────────────────────────────────────────────────────────
        // Myntra uses CSS background-image on .image-grid-image divs, not <img> tags
        const style = await page
            .locator(".image-grid-image")
            .first()
            .getAttribute("style")
            .catch(() => null);

        const image = style?.match(/url\("?(.*?)"?\)/)?.[1] ?? "";

        const images: string[] = await page
            .locator(".image-grid-image")
            .evaluateAll((els) =>
                els.map((el) => {
                    const s = el.getAttribute("style") || "";
                    const match = s.match(/url\("?(.*?)"?\)/);
                    return match ? match[1] : "";
                }).filter(Boolean)
            )
            .catch(() => []);

        // ── Sizes ─────────────────────────────────────────────────────────────
        const sizes = await page
            .locator(MyntraDetailsSelectors.SIZE)
            .allTextContents()
            .catch(() => []);

        const cleanedSizes = sizes.map(s => s.trim()).filter(Boolean);

        // ── Description (as array of bullet lines) ────────────────────────────
        // Myntra's "PRODUCT DETAILS" section renders each bullet as a <p> or <li>
        // inside .pdp-product-description-content
        const description: string[] = await page
            .locator(".pdp-product-description-content")
            .evaluateAll((containers) => {
                const lines: string[] = [];
                containers.forEach((container) => {
                    // Grab each paragraph, list item, or span as a separate bullet
                    const items = container.querySelectorAll("p, li, span");
                    if (items.length > 0) {
                        items.forEach((item) => {
                            const text = item.textContent?.trim();
                            if (text) lines.push(text);
                        });
                    } else {
                        // Fallback: split raw text by newlines
                        const raw = container.textContent?.trim() ?? "";
                        raw.split(/\n+/).forEach((line) => {
                            const t = line.trim();
                            if (t) lines.push(t);
                        });
                    }
                });
                return lines;
            })
            .catch(() => []);

        // ── Colors ────────────────────────────────────────────────────────────
        // Myntra shows alternate color swatches in a "MORE COLORS" section.
        // Each swatch link has an aria-label or title like "White", "Navy Blue", etc.
        const colors: string[] = await page
            .locator(".more-colors-container a, .moreColors-moreColorsContainer a")
            .evaluateAll((links) =>
                links
                    .map((a) =>
                        (a.getAttribute("aria-label") || a.getAttribute("title") || "").trim()
                    )
                    .filter(Boolean)
            )
            .catch(() => []);

        // ── Availability ──────────────────────────────────────────────────────
        // Considered out of stock if:
        //   • page body contains "OUT OF STOCK" text, OR
        //   • "ADD TO BAG" button is absent / disabled
        const availability: boolean = await page.evaluate(() => {
            const bodyText = document.body.innerText.toUpperCase();
            if (bodyText.includes("OUT OF STOCK")) return false;

            const addToBagBtn = document.querySelector<HTMLButtonElement>(
                "button.btn-primary, .size-buttons-addtocart-btn, [class*='addToBag'], [class*='add-to-bag']"
            );
            // If the button exists and is not disabled → available
            if (addToBagBtn && !addToBagBtn.disabled) return true;

            // If no sizes are available at all
            const sizeButtons = document.querySelectorAll(".size-buttons-size-button");
            const hasSelectableSize = Array.from(sizeButtons).some(
                (btn) => !btn.classList.toString().includes("disabled") &&
                         !btn.classList.toString().includes("unavailable")
            );
            return hasSelectableSize;
        }).catch(() => true);

        // ── Specifications ────────────────────────────────────────────────────
        const specifications: Record<string, string> = await page
            .locator(".index-tableContainer")
            .evaluateAll((containers) => {
                const specs: Record<string, string> = {};
                containers.forEach((container) => {
                    const rows = container.querySelectorAll("div[class*='row'], tr");
                    rows.forEach((row) => {
                        const cells = row.querySelectorAll("div, td");
                        if (cells.length >= 2) {
                            const key = cells[0].textContent?.trim();
                            const value = cells[1].textContent?.trim();
                            if (key && value) specs[key] = value;
                        }
                    });
                });
                return specs;
            })
            .catch(() => ({}));

        return {
            id: crypto.randomUUID(),

            title: title.trim(),

            brand: brand.trim(),

            description,

            price: normalizePrice(priceText),

            image,

            images,

            rating,

            ratingCount,

            sizes: cleanedSizes,

            colors,

            specifications,

            availability,

            platform: "myntra",

            url: page.url()
        };
    }

}