import { config } from "../config";
import { ProductDetails } from "../types/ProductDetails";
import { CacheStore } from "./CacheStore";
import { MemoryCache } from "./memoryCache";

export const productCache: CacheStore<ProductDetails> = new MemoryCache(
    config.CACHE_TTL_MS, config.CACHE_MAX_ENTRIES
);

export { CacheStore } from "./CacheStore";

