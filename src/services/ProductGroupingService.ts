import crypto from "crypto";
import { Product } from "../types/Product";
import { ProductGroup } from "../types/ProductGroup";

export class ProductGroupingService {
    static normalizeTitle(title: string): string {
        if (!title) return "";
        let clean = title.toLowerCase();

        // Replace common punctuation with spaces
        clean = clean.replace(/[,\-\(\)\[\]\/\+\|]/g, " ");

        // Remove noise words/phrases as standalone units or specific phrases
        // "pack of \d+"
        clean = clean.replace(/\bpack\s+of\s+\d+\b/g, "");
        
        const noisePhrases = [
            "regular fit",
            "slim fit",
            "pure cotton",
            "men",
            "women"
        ];
        for (const phrase of noisePhrases) {
            const regex = new RegExp(`\\b${phrase}\\b`, "g");
            clean = clean.replace(regex, "");
        }

        // Size tags (as standalone words: xl, l, m)
        clean = clean.replace(/\b(xl|l|m)\b/g, "");

        // Clean up spaces: replace multiple spaces with single space, trim
        return clean.replace(/\s+/g, " ").trim();
    }

    static group(products: Product[]): ProductGroup[] {
        const map = new Map<string, ProductGroup>();

        for (const product of products) {
            const key = this.normalizeTitle(product.title);

            if (!map.has(key)) {
                map.set(key, {
                    id: crypto.randomUUID(),
                    title: product.title,
                    brand: product.brand,
                    image: product.image || "",
                    offers: []
                });
            }

            map.get(key)!.offers.push({
                platform: product.platform,
                price: product.price,
                url: product.url,
                image: product.image || ""
            });
        }

        return [...map.values()];
    }
}
