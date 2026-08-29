import { ProductDetails } from "../types/ProductDetails";

class productCache {
    private cache = new Map<string, ProductDetails>();

    get(url: string) {
        return this.cache.get(url);
    }

    set(url: string, details: ProductDetails) {
        this.cache.set(url, details);
    }
    has(url: string): boolean {
        return this.cache.has(url);
    };

    clear(): void {
        this.cache.clear();
    }

}

export default new productCache();