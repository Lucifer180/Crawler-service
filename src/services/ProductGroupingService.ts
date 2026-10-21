import crypto from "crypto";
import { Product } from "../types/Product";
import { ProductGroup } from "../types/ProductGroup";
import { extractFeatures, matchScore, ProductFeatures } from "../matching/ProductMatcher";

interface Member {
    titleKey: string;
    features: ProductFeatures;
}

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

    /**
     * Groups listings that are the same product, across and within stores.
     * Expects products sorted by price, so each group's first member (and
     * each store's kept offer) is the cheapest.
     */
    static group(products: Product[]): ProductGroup[] {
        const groups: { group: ProductGroup; members: Member[] }[] = [];

        for (const product of products) {
            const member: Member = {
                titleKey: this.normalizeTitle(product.title),
                features: extractFeatures(product),
            };

            // Complete linkage: a product joins a group only if it matches
            // every member, so one loose match can't chain unrelated products.
            let best: (typeof groups)[number] | undefined;
            let bestScore = 0;
            for (const candidate of groups) {
                let score = Infinity;
                for (const existing of candidate.members) {
                    const pair = existing.titleKey === member.titleKey
                        ? 1
                        : matchScore(existing.features, member.features);
                    score = Math.min(score, pair);
                    if (score === 0) break;
                }
                if (score > bestScore) {
                    best = candidate;
                    bestScore = score;
                }
            }

            if (!best) {
                best = {
                    group: {
                        id: crypto.randomUUID(),
                        title: product.title,
                        brand: product.brand,
                        image: product.image || "",
                        offers: []
                    },
                    members: []
                };
                groups.push(best);
            }

            best.members.push(member);
            const { group } = best;

            // Stores phrase the same product differently; the shortest title is
            // usually the cleanest ("Puma Skyrocket Lite Running Shoes").
            if (product.title.length < group.title.length) group.title = product.title;
            if (!group.brand && product.brand) group.brand = product.brand;
            if (!group.image && product.image) group.image = product.image;

            const offer = {
                platform: product.platform,
                price: product.price,
                url: product.url,
                image: product.image || ""
            };

            // One offer per store. Several listings of the same product from
            // one store (resellers, sponsored + organic) keep only the cheapest.
            const existing = group.offers.findIndex(o => o.platform === offer.platform);
            if (existing === -1) {
                group.offers.push(offer);
            } else if (offer.price < group.offers[existing].price) {
                group.offers[existing] = offer;
            }
        }

        for (const { group } of groups) {
            group.offers.sort((a, b) => a.price - b.price);
        }

        return groups.map(({ group }) => group);
    }
}
