import PQueue from "p-queue";
import { config } from "../config";
import { TooBusyError } from "../errors/AppError";
export const CrawlQueue = new PQueue({
    concurrency: config.MAX_CONCURRENT_SESSIONS,
    timeout: config.CRAWL_TIMEOUT_MS
});

export function assertQueueHasRoom(): void {
    if (CrawlQueue.size >= config.MAX_QUEUE_DEPTH) {
        throw new TooBusyError(
            `Crawler backlog is ${CrawlQueue.size} deep,retry shortly`
        )
    }
};

export function queueStats(){
    return {
        running:CrawlQueue.pending,waiting:CrawlQueue.size
    }
}