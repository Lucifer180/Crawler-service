import { BaseFetcher } from "../base/BaseFetcher";
import BrowserManager from "../../browser/browserManager";
import { Page, BrowserContext } from "playwright";
import { logger } from "../../utils/logger";
import { toSlug } from "../../utils/parser.utils";
export class MyntraFetcher extends BaseFetcher {
    async search(query: string) {
        // Myntra listing pages are slug paths (/running-shoes); "%20" in the
        // path is not a page it serves.
        const slug = toSlug(query);
        // An all-symbol query slugs to "" and would load the homepage instead.
        if (!slug) throw new Error("Query has no searchable words for Myntra");

        const url = `https://www.myntra.com/${slug}`;

        return await this.navigate(url);

    }
    async getProduct(url: string): Promise<{ page: Page; context: BrowserContext }> {

        const { page, context } = await BrowserManager.createSession();
        // Handle relative URLs
        const fullUrl = url.startsWith("http")
            ? url
            : `https://www.myntra.com/${url}`;

        logger.debug({ url: fullUrl }, "opening Myntra product page");
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