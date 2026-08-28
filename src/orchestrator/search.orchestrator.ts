import registry from "../registry/crawler.register";
import { ProductProcessor } from "../processors/product.processor";
import { MergeService } from "../services/MergeService";
import { Product } from "../types/Product";
import { ProductGroupingService } from "../services/ProductGroupingService";
import { SortService } from "../services/sortService";
import { SearchResult } from "../types/searchResponse";

const MAX_PRODUCTS = 50;

export async function searchProducts(query: string): Promise<SearchResult> {
    const crawlers = registry.getAll();

    console.log(`[Orchestrator] Starting search for "${query}" with ${crawlers.length} crawlers.`);

    const results = await Promise.allSettled(
        crawlers.map(async (crawler) => {
            try {
                const products = await crawler.search(query);
                console.log(`[Orchestrator] Crawler "${crawler.platform}" succeeded. Found ${products.length} products.`);
                return products;
            } catch (err: any) {
                console.error(`[Orchestrator] Crawler "${crawler.platform}" failed:`, err.message || err);
                throw err;
            }
        })
    );

    const successfulResponses = results
        .filter((result): result is PromiseFulfilledResult<Product[]> => result.status === 'fulfilled')
        .map(result => result.value);

    console.log(`[Orchestrator] Successful responses count: ${successfulResponses.length}`);
    successfulResponses.forEach((list, idx) => {
        const platform = list[0]?.platform || `unknown-${idx}`;
        console.log(`  - Platform "${platform}": ${list.length} products`);
    });

    // 1. Merge products from all crawlers
    const merged = MergeService.merge(successfulResponses);
    console.log(`[Orchestrator] Merged count: ${merged.length}`);

    // 2. Remove invalid products (Filter out products with price <= 0 or empty titles)
    const processed = ProductProcessor.process(merged);
    console.log(`[Orchestrator] Processed count (after ProductProcessor): ${processed.length}`);

    // 3. Sort all products by price
    const sorted = SortService.byPrice(processed);

    // 4. Group by normalized title
    const grouped = ProductGroupingService.group(sorted);
    console.log(`[Orchestrator] Grouped count (after ProductGroupingService): ${grouped.length}`);
    
    console.table(
        grouped.map(g => ({
            id: g.id,
            title: g.title,
            brand: g.brand,
            offersCount: g.offers.length,
            cheapestPrice: g.offers[0]?.price
        }))
    );

    // 5. Return only the first MAX_PRODUCTS groups
    const groups = grouped.slice(0, MAX_PRODUCTS);
    console.log(`[Orchestrator] Returning top ${groups.length} groups.`);

    return {
        query,
        total: groups.length,
        groups
    };
}

