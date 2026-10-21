import { Page } from "playwright";
import { Product } from "../../types/Product";
import { FlipkartSelectors } from "./flipkartSelectors";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { logger } from "../../utils/logger";
import { absoluteUrl } from "../../utils/parser.utils";

const BASE_URL = "https://www.flipkart.com";

export class FlipKartParser {
    static async parse(page: Page): Promise<Product[]> {
        const cards = page.locator(FlipkartSelectors.PRODUCT_CARD);

        const count = await cards.count();

        logger.info({ platform: "flipkart", count }, "product cards found");

        if (count === 0) {
            throw new Error("No product cards found");
        }

        const products = await cards.evaluateAll((cards, selectors) => {
            return cards.slice(0, 20).map((card) => {
                const getText = (selector: string): string => {
                    return card.querySelector(selector)?.textContent?.trim() ?? "";
                };

                const getAttribute = (selector: string, attribute: string): string => {
                    return card.querySelector(selector)?.getAttribute(attribute)?.trim() ?? "";
                };

                return {
                    title:
                        getText(selectors.TITLE) ||
                        getAttribute(selectors.TITLE_ATTR, "title") ||
                        getAttribute(selectors.IMAGE, "alt"),
                    brand: getText(selectors.BRAND),
                    priceText: getText(selectors.PRICE),
                    image: getAttribute(selectors.IMAGE, "src"),
                    link: getAttribute(selectors.LINK, "href"),
                };
            });
        }, {
            TITLE: FlipkartSelectors.TITLE,
            TITLE_ATTR: FlipkartSelectors.TITLE_ATTR,
            BRAND: FlipkartSelectors.BRAND,
            PRICE: FlipkartSelectors.PRICE,
            IMAGE: FlipkartSelectors.IMAGE,
            LINK: FlipkartSelectors.LINK,
        });

        return products
            .map(({ title, brand, priceText, image, link }) => {
                const price = normalizePrice(priceText);
                const url = absoluteUrl(link, BASE_URL);

                // A comparison row nobody can click through is useless; drop it.
                if (!title || !price || !url) {
                    return null;
                }

                // The item id is the path segment after /p/ (query string carries pid/lid).
                const id = new URL(url).pathname.split("/p/")[1]?.split("/")[0] || crypto.randomUUID();

                // Grid titles omit the brand ("Running Shoes For Men"); prefix it so
                // the title matches how other stores name the same product.
                const fullTitle = brand && !title.toLowerCase().startsWith(brand.toLowerCase())
                    ? `${brand} ${title}`
                    : title;

                return {
                    id,
                    title: fullTitle,
                    brand,
                    price,
                    image: image || undefined,
                    url,
                    platform: "flipkart",
                };
            })
            .filter(p => p !== null) as Product[];
    }
}
