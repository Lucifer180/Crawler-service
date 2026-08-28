import { BaseFetcher } from "../base/BaseFetcher";
import { Page, BrowserContext } from "playwright";

export class FlipkartFetcher extends BaseFetcher {
    async search(query: string) {
        const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

        return this.navigate(url);
    }

    async getProduct(
        url: string
    ): Promise<{ page: Page; context: BrowserContext }> {
        const fullUrl = url.startsWith("http")
            ? url
            : `https://www.flipkart.com${url}`;

        // navigate() uses the desktop context (real UA + 1366x768). Without it
        // Flipkart serves the "fk-lite" layout, whose class names are generated
        // atomic CSS and match none of the PDP selectors.
        const { page, context } = await this.navigate(fullUrl);

        await page
            .waitForSelector('h1, span.VU-ZEz, script[type="application/ld+json"]', {
                timeout: 30000
            })
            .catch(() => null);

        return { page, context };
    }
}
