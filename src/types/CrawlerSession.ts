import { BrowserContext, Page } from "playwright";

export interface CrawlerSession {
    context: BrowserContext,
    page: Page,
    dispose(): Promise<void>
}