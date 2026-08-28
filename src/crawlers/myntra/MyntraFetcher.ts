import { BaseFetcher } from "../base/BaseFetcher";
import BrowserManager from "../../browser/browserManager";
import { Page, BrowserContext } from "playwright";
export class MyntraFetcher extends BaseFetcher {
    async search(query: string) {
        const url = `https://www.myntra.com/${encodeURIComponent(query)}`;

        return await this.navigate(url);

    }
    async getProduct(url: string): Promise<{ page: Page; context: BrowserContext }> {

        const { page, context } = await BrowserManager.createSession();
        // Handle relative URLs
        const fullUrl = url.startsWith("http")
            ? url
            : `https://www.myntra.com/${url}`;

        console.log("fullUrl", fullUrl);
        await page.goto(fullUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForSelector("main", {
            timeout: 10000
        });
        // await page.waitForLoadState("networkidle");

        return { page, context };
    }
}