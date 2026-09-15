import { BrowserContext, Page } from "playwright";
import { assertQueueHasRoom, CrawlQueue } from "../queue/CrawleQueue";
import { logger } from "../utils/logger";

type OpenSession = () => Promise<{ page: Page, context: BrowserContext }>;

export async function withSession<T>(open: OpenSession, use: (page: Page)=>Promise<T>): Promise<T> {
    assertQueueHasRoom();
    return CrawlQueue.add(async () => {
        let context: BrowserContext | undefined;

        try {
            const session = await open();
            return await use(session.page)
        } finally {
            if (context) {
                await context.close().catch(err => logger.warn({ err }, "context close failed"));
            }
        }
    })
}