import { Page } from "playwright";
import { Product } from "../../types/Product";
import { FlipkartSelectors } from "./flipkartSelectors";
import { normalizePrice } from "../../normalizers/product.normalizer";

export class FlipKartParser {
    static async parse(page: Page): Promise<Product[]> {
         const cards = page.locator(FlipkartSelectors.PRODUCT_CARD);

                    const count = await cards.count();

                    console.log("Cards Found:", count);

                    if (count === 0) {
                        throw new Error("No product cards found");
                    }
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

// import crypto from "crypto";
// import { Page, Locator } from "playwright";
// import { Product } from "../../types/Product";
// import { FlipkartSelectors } from "./flipkartSelectors";
// import { normalizePrice } from "../../normalizers/product.normalizer";

// const MAX_PRODUCTS = 20;

// export class FlipKartParser {

//     private async safeText(locator: Locator): Promise<string> {
//         try {
//             return (await locator.textContent())?.trim() ?? "";
//         } catch {
//             return "";
//         }
//     }

//     private async safeAttribute(
//         locator: Locator,
//         attribute: string
//     ): Promise<string> {
//         try {
//             return (await locator.getAttribute(attribute)) ?? "";
//         } catch {
//             return "";
//         }
//     }

//     async parse(page: Page): Promise<Product[]> {

//         await page.waitForSelector(
//             FlipkartSelectors.PRODUCT_CARD,
//             { timeout: 15000 }
//         );

//         const cards = page.locator(
//             FlipkartSelectors.PRODUCT_CARD
//         );

//         const count = Math.min(
//             await cards.count(),
//             MAX_PRODUCTS
//         );

//         console.log(`Found ${count} Flipkart Products`);

//         const products: Product[] = [];

//         for (let i = 0; i < count; i++) {
//             const first = page.locator("div[data-id]").first();

//             console.log(
//                 await first.evaluate((el) => {
//                     return [...el.querySelectorAll("*")]
//                         .map((e) => ({
//                             tag: e.tagName,
//                             class: e.className,
//                             text: e.textContent?.trim(),
//                         }))
//                         .filter((x) => x.text && x.text.length > 0);
//                 })
//             );

//             const card = cards.nth(i);

//             const title = await this.safeText(
//                 card.locator(FlipkartSelectors.TITLE)
//             );

//             const priceText = await this.safeText(
//                 card.locator(FlipkartSelectors.PRICE)
//             );

//             const imageLocator = card.locator(
//                 FlipkartSelectors.IMAGE
//             );

//             const image =
//                 await this.safeAttribute(imageLocator, "src") ||
//                 await this.safeAttribute(imageLocator, "srcset");

//             const link = await this.safeAttribute(
//                 card.locator(FlipkartSelectors.LINK),
//                 "href"
//             );

//             console.log({
//                 title,
//                 priceText,
//                 image,
//                 link
//             });

//             const price = normalizePrice(priceText);

//             if (!title || !price)
//                 continue;

//             products.push({
//                 id: crypto.randomUUID(),
//                 title,
//                 brand: "",
//                 price,
//                 image,
//                 url: link.startsWith("http")
//                     ? link
//                     : `https://www.flipkart.com${link}`,
//                 platform: "flipkart"
//             });
//         }

//         return products;
//     }
// }