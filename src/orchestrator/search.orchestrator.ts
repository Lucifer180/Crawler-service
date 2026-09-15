import registry from "../registry/crawler.register";
import { ProductProcessor } from "../processors/product.processor";
import { MergeService } from "../services/MergeService";
import { Product } from "../types/Product";
import { ProductGroupingService } from "../services/ProductGroupingService";
import { SortService } from "../services/sortService";
import { SearchResult, SourceReport } from "../types/searchResponse";
import { CrawlQueue } from "../queue/CrawleQueue";
import { logger, Logger } from "../utils/logger";
import { withRetry } from "../utils/retry";

const MAX_PRODUCTS = 50;
const log = logger.child({ component: "search-orchestrator" });

export interface SearchOptions {
    limit?: number;
    log?: Logger;
}

export async function searchProducts(query: string, options?: SearchOptions): Promise<SearchResult> {
    const log = options?.log ?? logger;
    const limit = options?.limit ?? 20;

    const crawlers = registry.getAll();

    const settled = await Promise.all(
        crawlers.map(async (crawler): Promise<{
            report: SourceReport;
            products: Product[];
        }> => {
            const startedAt = Date.now();

            try {
                const products = await withRetry(
                    () => crawler.search(query),
                    {
                        label: `${crawler.platform}:search`, attempts: 2
                    }
                );

                return {
                    products,
                    report: {
                        platform: crawler.platform,
                        status: "ok",
                        count: products.length,
                        durationMs: Date.now() - startedAt
                    }
                }
            } catch (error) {
                log.warn(
                    { platform: crawler.platform, err: error },
                    "crawler failed"
                );
                return {
                    products: [],
                    report: {
                        platform: crawler.platform,
                        status: "failed",
                        count: 0,
                        durationMs: Date.now() - startedAt,
                        error:
                            error instanceof Error ? error.message : String(error)
                    }
                };
            }

        }));

    const sources = settled.map(s => s.report);
    const merged = MergeService.merge(settled.map(s => s.products));
    const processed = ProductProcessor.process(merged);
    const sorted = SortService.byPrice(processed);
    const grouped = ProductGroupingService.group(sorted);;

    return {
        query,
        total: grouped.length,
        sources,
        groups: grouped.slice(0, limit)
    }
}
