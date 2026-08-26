import registry from "../registry/crawler.register";
import { ProductProcessor } from "../processors/product.processor";
import { MergeService } from "../services/MergeService";
import { Product } from "../types/Product";
import { DuplicateService } from "../services/DuplicateService";
import { SortService } from "../services/sortService";
const MAX_PRODUCTS = 15;

export async function searchProducts(query: string) {
    const crawlers = registry.getAll();

    const results = await Promise.allSettled(
        crawlers.map(crawler => crawler.search(query))
    );

    const successfulResponses = results
        .filter((result): result is PromiseFulfilledResult<Product[]> => result.status === 'fulfilled')
        .map(result => result.value);

    // 1. Merge products from all crawlers
    const merged = MergeService.merge(successfulResponses);

    // 2. Remove duplicate products
    const unique = DuplicateService.remove(merged);

    // 3. Remove invalid products
    const processed = ProductProcessor.process(unique);

    // 4. Sort by price
    const sorted = SortService.byPrice(processed);

    // 5. Return only the first 15
    const products = sorted.slice(0, MAX_PRODUCTS);

    return {
        query,
        total: products.length,
        products
    };
}
