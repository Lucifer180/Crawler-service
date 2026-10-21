import { Locator, Page } from "playwright";
import { Product } from "../../types/Product";
import { MyntraSelectors } from "./MyntraSelectors";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { logger } from "../../utils/logger";
import { absoluteUrl } from "../../utils/parser.utils";

const MAX_PRODUCTS = 15;

export class MyntraParser {


  async parse(page: Page): Promise<Product[]> {
    const products = await page
        .locator(MyntraSelectors.PRODUCT_CARD)
        .evaluateAll((cards, selectors) => {
            return cards.slice(0, 20).map((card) => {
                const getText = (selector: string): string => {
                    return (
                        card.querySelector(selector)?.textContent?.trim() ?? ""
                    );
                };

                const getAttribute = (
                    selector: string,
                    attribute: string
                ): string | null => {
                    return (
                        card
                            .querySelector(selector)
                            ?.getAttribute(attribute) ?? null
                    );
                };

                const title = getText(selectors.TITLE);
                const brand = getText(selectors.BRAND);
                const priceText = getText(selectors.PRICE);
                const image = getAttribute(selectors.IMAGE, "src");
                const link = getAttribute(selectors.LINK, "href");

                return {
                    title,
                    brand,
                    priceText,
                    image,
                    link,
                };
            });
        }, {
            TITLE: MyntraSelectors.TITLE,
            BRAND: MyntraSelectors.BRAND,
            PRICE: MyntraSelectors.PRICE,
            IMAGE: MyntraSelectors.IMAGE,
            LINK: MyntraSelectors.LINK,
        });

    logger.info({ platform: "myntra", count: products.length }, "products found");

    return products
        .map(({ title, brand, priceText, image, link }) => {
            const price = normalizePrice(priceText);
            // Myntra hrefs are relative ("sports-shoes/puma/.../32588864/buy").
            const url = absoluteUrl(link, "https://www.myntra.com");

            if (!title || !price || !url) {
                return null;
            }

            // The numeric style id sits just before the trailing "/buy".
            const id = new URL(url).pathname.split("/").filter(Boolean).find(part => /^\d+$/.test(part))
                ?? crypto.randomUUID();

            return {
                id,
                title: `${brand} ${title}`.trim(),
                brand: brand.trim(),
                price,
                image: image || undefined,
                url,
                platform: "myntra",
            };
        })
        .filter(p => p !== null) as Product[];
}
}
