// tests/unit/grouping.test.ts
import { describe, expect, it } from "vitest";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { ProductGroupingService } from "../../services/ProductGroupingService";


describe("normalizePrice", () => {
    it("strips currency symbols and separators", () => {
        expect(normalizePrice("₹29,999")).toBe(29999);
        expect(normalizePrice("Rs. 1,299")).toBe(1299);
    });

    it("returns 0 for text with no digits", () => {
        expect(normalizePrice("Out of stock")).toBe(0);
    });

    // This one documents a real sharp edge: the current implementation strips
    // every non-digit, so a decimal price silently multiplies by 100.
    it("does not preserve decimals (known limitation)", () => {
        expect(normalizePrice("₹1,299.50")).toBe(129950);
    });
});

describe("ProductGroupingService", () => {
    it("groups the same product from two platforms into one group", () => {
        const groups = ProductGroupingService.group([
            { title: "Nike Air Max, Men", price: 5999, url: "a", platform: "myntra" },
            { title: "Nike Air Max (Men)", price: 5499, url: "b", platform: "flipkart" }
        ]);

        expect(groups).toHaveLength(1);
        expect(groups[0].offers.map(o => o.platform).sort()).toEqual([
            "flipkart",
            "myntra"
        ]);
    });
});