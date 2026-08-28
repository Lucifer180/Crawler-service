import BrowserManager from "../../browser/browserManager";
import { Page, BrowserContext } from "playwright";

export interface FetchResult {
    page: Page;
    context: BrowserContext;
};

export abstract class BaseFetcher {
    
    protected async navigate(url: string): Promise<FetchResult> {
        const context = await BrowserManager.createContext();

        const page = await context.newPage();

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        return { page, context }

    };

    protected async dispose(context: BrowserContext) {
        await context.close();
    };


}