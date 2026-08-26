import { Locator, Page } from "playwright";
import { Product } from "../../types/Product";
import { MyntraSelectors } from "./MyntraSelectors";
import { normalizePrice } from "../../normalizers/product.normalizer";

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

    console.log(`Found ${products.length} products on Myntra`);

    return products
        .map(({ title, brand, priceText, image, link }) => {
            const price = normalizePrice(priceText);

            const id = link
                ? link.split("/").pop()?.split("?")[0] ?? crypto.randomUUID()
                : crypto.randomUUID();

            if (!title || !price) {
                return null;
            }

            return {
                id,
                title: `${brand} ${title}`.trim(),
                brand: brand.trim(),
                price,
                image,
                url: link,
                platform: "myntra",
            };
        })
        .filter(p => p !== null) as Product[];
}
}
