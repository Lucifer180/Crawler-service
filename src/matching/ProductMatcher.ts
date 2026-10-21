import { Product } from "../types/Product";

/**
 * Decides whether two listings (usually from different stores) are the same
 * product. Stores word titles very differently:
 *
 *   flipkart  "Apple iPhone 17 (Black, 256 GB)"
 *   amazon    "Apple iPhone 17 256 GB: 15.93 cm (6.3″) Display with ..."
 *   myntra    "OnePlus Nord 3r TWS Earbuds"          (drops "Buds")
 *   amazon    "OnePlus Nord Buds 3r TWS Earbuds up to 54 Hours Playback, ..."
 *
 * so plain string similarity both misses real matches and makes false ones
 * ("CASE CREATION Galaxy S25 Case" vs "Samsung Galaxy S25"). Instead each
 * title is reduced to the parts that identify a product, and every part has
 * to agree. A wrong merge shows someone a "lowest price" for a different
 * product, so every rule errs towards NOT merging.
 */

export interface ProductFeatures {
    brand: string;
    /** Digit-bearing tokens and variant words from the title head: {"s25", "plus"}. */
    model: Set<string>;
    /** The product's own name words, after the brand and before the first category word. */
    name: string[];
    /** Largest GB figure in the title (storage, not RAM), if any. */
    storageGb?: number;
    /** Non-numeric words inside (...) — in practice the colour. */
    attributes: Set<string>;
    price: number;
}

// Words that change which product it is: "S25" vs "S25 FE", "141" vs "141 Elite".
const VARIANT_WORDS = new Set([
    "pro", "max", "plus", "ultra", "lite", "mini", "elite", "neo", "prime", "fe", "edge", "se"
]);

// Descriptive or category words: they say what kind of thing it is, not which one.
const GENERIC_WORDS = new Set([
    "a", "an", "and", "the", "in", "on", "of", "by", "to", "for", "with", "s",
    "new", "newly", "launch", "launched", "latest", "original", "premium", "edition",
    "men", "mens", "man", "women", "womens", "woman", "boys", "girls", "kids", "unisex", "adult", "youth",
    "running", "shoe", "shoes", "sneaker", "sneakers", "sports", "sport", "training", "walking", "gym",
    "casual", "lightweight", "lace", "up", "jeans", "jean", "fit", "slim", "tapered", "straight", "bootcut",
    "relaxed", "loose", "regular", "skinny", "baggy", "mid", "high", "low", "rise", "stretchable",
    "stretch", "cotton", "denim", "solid", "tws", "earbuds", "earbud", "earphones", "earphone",
    "headphones", "headphone", "headset", "wireless", "true", "truly", "bluetooth", "ear", "mobile",
    "phone", "smartphone", "ai", "black", "white", "blue", "dark", "light", "grey", "gray", "navy",
    "red", "green", "brown", "pink", "silver", "gold"
]);

// Category words that sit inside product names and that some stores drop:
// Myntra lists "OnePlus Nord Buds 3r" as "OnePlus Nord 3r".
const TRANSPARENT_WORDS = new Set(["buds"]);

// Measurements are specs, not model numbers: 13mm, 50h, 5g, 12gb, 5000mah.
const UNIT_TOKEN = /^\d+(\.\d+)?(mm|cm|h|hr|hrs|hours?|mah|w|db|ms|mp|g|gb|tb|mb|ml|inch|mic|mics|x)$/;
const YEAR_TOKEN = /^20\d\d$/;
// Store SKU codes ("E518A") that one store prints and another omits. At least
// two digits, so generation markers like "gen2" or "v2" never count as one.
const SKU_TOKEN = /^(?!gen\d)(?=.*[a-z])(?=(?:.*\d){2})[a-z0-9]{4,}$/;

const tokenize = (text: string): string[] =>
    text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[’']/g, "")       // Levi's -> levis
        .replace(/(\w)\+/g, "$1 plus")    // S25+ -> s25 plus
        .replace(/\bgen\s+(\d+)\b/g, "gen$1")
        // "256 GB" -> "256gb" so it reads as a measurement, not a model number.
        .replace(/(\d)\s+(gb|tb|mb|mm|cm|mah|mp|hrs?|hours?|db|ms|w|inch)\b/g, "$1$2")
        .split(/[^a-z0-9.]+/)
        .map(token => token.replace(/^\.+|\.+$/g, ""))
        .filter(Boolean);

/**
 * The identifying part of a title is at the front; after the first
 * separator or "with ..." it turns into a spec sheet.
 */
const titleHead = (title: string): string =>
    title.split(/[,|(\[:–—]|\s-\s|\.\.\.|\s(?:with|featuring|for|up to|upto)\s/i)[0];

const brandKey = (brand: string) => tokenize(brand).join("");

export function extractFeatures(product: Product): ProductFeatures {
    const titleTokens = tokenize(product.title);
    const brandTokens = product.brand ? tokenize(product.brand) : titleTokens.slice(0, 1);
    const brandSet = new Set(brandTokens);

    const headTokens = tokenize(titleHead(product.title)).filter(token => !brandSet.has(token));

    // The product's own name is the run of words before the first category or
    // spec word: "Unisex-Adult [Skyrocket Lite 2 Alt] Running Shoe",
    // "Samsung [Galaxy S25] 5G Snapdragon". Words after that are marketing that
    // one store adds and another doesn't.
    const model = new Set<string>();
    const name: string[] = [];
    let started = false;
    for (const token of headTokens) {
        if (TRANSPARENT_WORDS.has(token)) continue;
        const isFiller =
            UNIT_TOKEN.test(token) ||
            YEAR_TOKEN.test(token) ||
            GENERIC_WORDS.has(token) ||
            (token.length === 1 && !/\d/.test(token));
        if (isFiller) {
            if (started) break;
            continue;
        }
        started = true;
        if (/\d/.test(token) || VARIANT_WORDS.has(token)) model.add(token);
        else name.push(token);
    }

    const storage = [...product.title.matchAll(/(\d+)\s*(gb|tb)\b/gi)]
        .map(([, amount, unit]) => Number(amount) * (unit.toLowerCase() === "tb" ? 1024 : 1));

    const attributes = new Set<string>();
    for (const [, inside] of product.title.matchAll(/\(([^)]*)\)/g)) {
        for (const token of tokenize(inside)) {
            if (/\d/.test(token) || ["gb", "tb", "ram", "rom", "storage", "men", "women", "unisex"].includes(token)) continue;
            attributes.add(token);
        }
    }

    return {
        brand: brandKey(brandTokens.join(" ")),
        model,
        name,
        storageGb: storage.length ? Math.max(...storage) : undefined,
        attributes,
        price: product.price,
    };
}

const MAX_PRICE_RATIO = 2;

/** Model tokens agree if equal, or one side only adds store SKU codes. */
function modelsAgree(a: Set<string>, b: Set<string>): boolean {
    const [small, large] = a.size <= b.size ? [a, b] : [b, a];
    for (const token of small) if (!large.has(token)) return false;
    for (const token of large) if (!small.has(token) && !SKU_TOKEN.test(token)) return false;
    return true;
}

/**
 * Returns a similarity score in (0, 1] when a and b are the same product, or
 * 0 when any identifying part disagrees.
 */
export function matchScore(a: ProductFeatures, b: ProductFeatures): number {
    if (!a.brand || a.brand !== b.brand) return 0;

    const [cheap, dear] = a.price <= b.price ? [a.price, b.price] : [b.price, a.price];
    if (dear > cheap * MAX_PRICE_RATIO) return 0;

    if (!modelsAgree(a.model, b.model)) return 0;

    if (a.storageGb !== undefined && b.storageGb !== undefined && a.storageGb !== b.storageGb) return 0;

    if (a.attributes.size && b.attributes.size && ![...a.attributes].some(token => b.attributes.has(token))) {
        return 0;
    }

    // Brand + model number alone identifies it ("Levi's 512"), but only a real
    // number: "Levi's Pro" with no other words could be anything.
    if (!a.name.length || !b.name.length) {
        const hasNumber = [...a.model].some(token => /\d/.test(token));
        return hasNumber && !a.name.length && !b.name.length ? 0.6 : 0;
    }

    // Names must be the same words. Even one extra word is a different model:
    // "Skyrocket Lite 2 Alt" vs "Skyrocket Lite 2", "Airdopes Joy" vs "Airdopes Ace".
    const nameA = new Set(a.name);
    const nameB = new Set(b.name);
    if (nameA.size !== nameB.size || [...nameA].some(token => !nameB.has(token))) return 0;

    // A model number makes the match more certain than a name alone ("Glidepacer").
    return a.model.size > 0 ? 1 : 0.8;
}

export const ProductMatcher = { extractFeatures, matchScore };
