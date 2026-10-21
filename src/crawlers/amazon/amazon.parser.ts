import { Page } from "playwright";
import { Product } from "../../types/Product";
import { AmazonConstants, AmazonSelectors } from "./amazon.constans";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { logger } from "../../utils/logger";

const MAX_PRODUCTS = 20;

export class AmazonParser {
    async parse(page: Page): Promise<Product[]> {
        await page
            .waitForSelector(AmazonSelectors.PRODUCT_CARD, { timeout: 15000 })
            .catch(() => null);

        const products = await page
            .locator(AmazonSelectors.PRODUCT_CARD)
            .evaluateAll((cards, { selectors, max }) => {
                return cards.slice(0, max).map((card) => {
                    const headings = [...card.querySelectorAll(selectors.HEADINGS)]
                        .map(h => h.textContent?.trim() ?? "")
                        .filter(Boolean);

                    return {
                        asin: card.getAttribute("data-asin") ?? "",
                        brand: headings.length > 1 ? headings[0] : "",
                        title: headings[headings.length - 1] ?? "",
                        priceText: card.querySelector(selectors.PRICE)?.textContent?.trim() ?? "",
                        image: card.querySelector(selectors.IMAGE)?.getAttribute("src") ?? "",
                    };
                });
            }, {
                selectors: {
                    HEADINGS: AmazonSelectors.HEADINGS,
                    PRICE: AmazonSelectors.PRICE,
                    IMAGE: AmazonSelectors.IMAGE,
                },
                max: MAX_PRODUCTS,
            });

        logger.info({ platform: "amazon", count: products.length }, "products found");

        if (products.length === 0) {
            // Either a genuine empty result or a bot wall; both look the same here.
            const blocked = await page.locator('form[action*="validateCaptcha"]').count();
            if (blocked > 0) throw new Error("Amazon served a captcha");
        }

        return products
            .map(({ asin, brand, title, priceText, image }) => {
                const price = normalizePrice(priceText);

                if (!asin || !title || !price) {
                    return null;
                }

                const fullTitle = brand && !title.toLowerCase().startsWith(brand.toLowerCase())
                    ? `${brand} ${title}`
                    : title;

                return {
                    id: asin,
                    title: fullTitle,
                    brand,
                    price,
                    image: image || undefined,
                    url: AmazonConstants.PRODUCT_URL(asin),
                    platform: "amazon",
                };
            })
            .filter(p => p !== null) as Product[];
    }
}
