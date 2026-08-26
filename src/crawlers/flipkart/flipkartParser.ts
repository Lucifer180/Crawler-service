import { Page } from "playwright";
import { Product } from "../../types/Product";
import { FlipkartSelectors } from "./flipkartSelectors";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { getAttribute, safeText } from "../../utils/parser.utils";

export class FlipKartParser {
  async parse(page: Page): Promise<Product[]> {
    const products = await page
        .locator(FlipkartSelectors.PRODUCT_CARD)
        .evaluateAll((cards, selectors) => {
            return cards.slice(0, 20).map((card) => {
                const getText = (selector: string): string => {
                    return card.querySelector(selector)?.textContent?.trim() ?? "";
                };

                const getAttribute = (
                    selector: string,
                    attribute: string
                ): string | null => {
                    return card.querySelector(selector)?.getAttribute(attribute) ?? null;
                };

                return {
                    title: getText(selectors.TITLE),
                    priceText: getText(selectors.PRICE),
                    image: getAttribute(selectors.IMAGE, "src"),
                    link: getAttribute(selectors.LINK, "href"),
                };
            });
        }, {
            TITLE: FlipkartSelectors.TITLE,
            PRICE: FlipkartSelectors.PRICE,
            IMAGE: FlipkartSelectors.IMAGE,
            LINK: FlipkartSelectors.LINK,
        });

    return products
        .map(({ title, priceText, image, link }) => {
            const price = normalizePrice(priceText);

            const id = link
                ? link.split("/").pop()?.split("?")[0] ?? crypto.randomUUID()
                : crypto.randomUUID();

            if (!title || !price) {
                return null;
            }

            return {
                id,
                title,
                brand: "",
                price,
                image,
                url: link,
                platform: "flipkart",
            };
        })
        .filter(p => p !== null) as Product[];
}
}