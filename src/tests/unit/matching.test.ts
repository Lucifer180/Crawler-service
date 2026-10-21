// tests/unit/matching.test.ts
// Titles are real listings captured from live crawls on 2026-10-21.
import { describe, expect, it } from "vitest";
import { extractFeatures, matchScore } from "../../matching/ProductMatcher";
import { ProductGroupingService } from "../../services/ProductGroupingService";
import { Product } from "../../types/Product";

const listing = (platform: string, title: string, price: number, brand = ""): Product => ({
    platform, title, price, brand, url: `https://${platform}.example/${encodeURIComponent(title)}`
});

const same = (a: Product, b: Product) => matchScore(extractFeatures(a), extractFeatures(b)) > 0;

describe("ProductMatcher: same product across stores", () => {
    it.each([
        [
            "model number, very different wording",
            listing("flipkart", "boAt Airdopes 219, 40H Battery, Free Music Streaming & Best in Segment for Calling Bluetooth", 865),
            listing("myntra", "boAt Airdopes 219 Wireless Earbuds", 1099, "boAt"),
        ],
        [
            "store drops a word of the product line",
            listing("amazon", "OnePlus Nord Buds 3r TWS Earbuds up to 54 Hours Playback, 2-mic Clear Calls", 1999),
            listing("myntra", "OnePlus Nord 3r TWS Earbuds", 1899, "OnePlus"),
        ],
        [
            // The live Amazon title continues "... E518A Raven Black", and "Raven"
            // (a colour name the matcher can't tell from a model word) blocks it.
            "store adds a SKU code",
            listing("amazon", "OnePlus Nord Buds 4 Pro E518A", 4014),
            listing("myntra", "OnePlus Nord Buds 4 Pro Earphones", 4299, "OnePlus"),
        ],
        [
            "phone with matching colour and storage",
            listing("flipkart", "Samsung Galaxy S25 5G Snapdragon (Navy, 128 GB)", 58999),
            listing("amazon", "Samsung Galaxy S25 5G (Navy, 12GB RAM, 128GB Storage) | Snapdragon 8 Elite for Galaxy", 59975),
        ],
        [
            "S25+ is written S25 Plus elsewhere",
            listing("flipkart", "Samsung Galaxy S25 Plus 5G (Silver Shadow, 256 GB)", 75519),
            listing("amazon", "Samsung Galaxy S25+ 5G AI Smartphone (Silver Shadow, 12GB RAM, 256GB Storage)", 89999),
        ],
        [
            "brand spelt three ways, fashion model number",
            listing("flipkart", "LEVI'S 512 Men Slim Mid Rise Blue Jeans", 899, "LEVI'S"),
            listing("myntra", "Levis Men 512 Slim Fit Jeans", 1079, "Levis"),
        ],
        [
            "named model, no number",
            listing("amazon", "PUMA Unisex-Adult Glidepacer Running Shoe", 4049, "PUMA"),
            listing("flipkart", "PUMA Glidepacer Running Shoes For Men", 4229, "PUMA"),
        ],
    ])("matches: %s", (_, a, b) => {
        expect(same(a, b)).toBe(true);
    });
});

describe("ProductMatcher: different products", () => {
    it.each([
        [
            "a case for the product (different brand)",
            listing("myntra", "CASE CREATION Samsung Galaxy S25 5G Back Case Mobile Accessories", 499, "CASE CREATION"),
            listing("flipkart", "Samsung Galaxy S25 5G Snapdragon (Navy, 128 GB)", 58999),
        ],
        [
            "a knock-off naming the real product",
            listing("flipkart", "Bxeno Nord Buds 3r TWS Earbuds up to 48HR Playback", 495),
            listing("amazon", "OnePlus Nord Buds 3r TWS Earbuds up to 54 Hours Playback", 1999),
        ],
        [
            "next generation",
            listing("amazon", "boAt Airdopes 141, Up to 50 Hours Playtime, Quad Mics ENx Tech", 999),
            listing("flipkart", "boAt Airdopes 141 Gen 2, 4 Mics ENx Tech,48H Battery", 899),
        ],
        [
            "variant word",
            listing("flipkart", "Samsung Galaxy S25 FE 5G (Navy, 128 GB)", 46999),
            listing("amazon", "Samsung Galaxy S25 5G (Navy, 12GB RAM, 128GB Storage)", 59975),
        ],
        [
            "numbered successor",
            listing("amazon", "PUMA Unisex-Adult Skyrocket Lite Running Shoe", 2249, "PUMA"),
            listing("myntra", "Puma Skyrocket Lite 2 Running Shoes", 3249, "Puma"),
        ],
        [
            "different storage",
            listing("flipkart", "Samsung Galaxy S25 5G Snapdragon (Navy, 128 GB)", 58999),
            listing("amazon", "Samsung Galaxy S25 5G (Navy, 256 GB) (12 GB RAM)", 65900),
        ],
        [
            "different colour",
            listing("flipkart", "Samsung Galaxy S25 5G Snapdragon (Icyblue, 128 GB)", 58999),
            listing("amazon", "Samsung Galaxy S25 5G (Navy, 12GB RAM, 128GB Storage)", 59975),
        ],
        [
            "same line, different model name",
            listing("amazon", "PUMA Unisex-Adult Softride Carson Sliptech II Running Shoe", 2219, "PUMA"),
            listing("myntra", "Puma Softride Frequence Sneakers", 2449, "Puma"),
        ],
        [
            "an extra model word",
            listing("flipkart", "PUMA Skyrocket Lite 2 Alt Running Shoes For Men", 1704, "PUMA"),
            listing("myntra", "Puma Skyrocket Lite 2 Running Shoes", 3249, "Puma"),
        ],
        [
            "only descriptive words in common",
            listing("flipkart", "LEVI'S Men Straight Fit Mid Rise Blue Jeans", 1099, "LEVI'S"),
            listing("myntra", "Levis Men Straight Fit Jeans", 979, "Levis"),
        ],
    ])("does not match: %s", (_, a, b) => {
        expect(same(a, b)).toBe(false);
    });
});

describe("ProductGroupingService cross-store grouping", () => {
    it("puts one product from three stores in one group, cheapest first", () => {
        const groups = ProductGroupingService.group([
            listing("flipkart", "boAt Airdopes 219, 40H Battery, Free Music Streaming Bluetooth", 865),
            listing("amazon", "boAt Airdopes 219, 4Mics ENx, 40H Battery, Best in Segment for Calling", 877),
            listing("myntra", "boAt Airdopes 219 Wireless Earbuds", 1099, "boAt"),
            listing("myntra", "boAt Airdopes 212 Noir Earbuds", 1099, "boAt"),
        ]);

        expect(groups).toHaveLength(2);
        expect(groups[0].offers.map(o => o.platform)).toEqual(["flipkart", "amazon", "myntra"]);
        expect(groups[0].title).toBe("boAt Airdopes 219 Wireless Earbuds");
    });

    it("does not chain: a product must match every member of a group", () => {
        // B matches A and C matches B, but C is a different storage from A.
        const groups = ProductGroupingService.group([
            listing("flipkart", "Samsung Galaxy S25 5G Snapdragon (Navy, 128 GB)", 58999),
            listing("amazon", "Samsung Galaxy S25 5G (Navy) | Snapdragon 8 Elite", 59975),
            listing("myntra", "Samsung Galaxy S25 5G (Navy, 256 GB)", 65900),
        ]);

        const first = groups.find(g => g.offers.some(o => o.platform === "flipkart"))!;
        expect(first.offers.map(o => o.platform)).not.toContain("myntra");
    });
});
