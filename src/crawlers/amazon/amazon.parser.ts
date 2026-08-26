import { Page } from "playwright";
import { Product } from "../../types/Product";
import { AmazonSelectors } from "./amazon.constans";
import { normalizePrice } from "../../normalizers/product.normalizer";

const MAX_PRODUCTS = 20;

export class AmazonParser {
    async parse(page: Page): Promise<Product[]> {
        const products = await page
            .locator(AmazonSelectors.PRODUCT_CARD)
            .evaluateAll((cards, selectors) => {
                return cards.slice(0, 20).map((card) => {
                    const getText = (selector: string): string => {
                        return (
                            card
                                .querySelector(selector)
                                ?.textContent
                                ?.trim() ?? ""
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

                    return {
                        title: getText(selectors.TITLE),
                        priceText: getText(selectors.PRICE),
                        image: getAttribute(selectors.IMAGE, "src"),
                        link: getAttribute(selectors.LINK, "href"),
                    };
                });
            }, {
                TITLE: AmazonSelectors.TITLE,
                PRICE: AmazonSelectors.PRICE,
                IMAGE: AmazonSelectors.IMAGE,
                LINK: AmazonSelectors.LINK,
            });

        console.log(`Found ${products.length} products on Amazon`);

        return products
            .map(({ title, priceText, image, link }) => {
                const price = normalizePrice(priceText);

                if (!title || !price) {
                    return null;
                }

                const id = link
                    ? link.split("/dp/")[1]?.split("/")[0] ??
                      link.split("/").pop()?.split("?")[0] ??
                      crypto.randomUUID()
                    : crypto.randomUUID();

                return {
                    id,
                    title,
                    brand: "",
                    price,
                    image,
                    url: link
                        ? link.startsWith("http")
                            ? link
                            : `https://www.amazon.in${link}`
                        : null,
                    platform: "amazon",
                };
            })
             .filter(p => p !== null) as Product[];
    }
}