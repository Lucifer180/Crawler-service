// tests/unit/grouping.test.ts
import { describe, expect, it } from "vitest";
import { normalizePrice } from "../../normalizers/product.normalizer";
import { ProductGroupingService } from "../../services/ProductGroupingService";
import { absoluteUrl, toSlug } from "../../utils/parser.utils";

describe("ProductGroupingService offers", () => {
    it("keeps one offer per platform, the cheapest, sorted by price", () => {
        const [group, ...rest] = ProductGroupingService.group([
            { title: "Trendy Sports Running Shoes For Men", price: 199, url: "fk-1", platform: "flipkart" },
            { title: "Trendy Sports Running Shoes For Men", price: 148, url: "fk-2", platform: "flipkart" },
            { title: "Trendy Sports Running Shoes For Men", price: 120, url: "am-1", platform: "amazon" }
        ]);

        expect(rest).toHaveLength(0);
        expect(group.offers).toEqual([
            { platform: "amazon", price: 120, url: "am-1", image: "" },
            { platform: "flipkart", price: 148, url: "fk-2", image: "" }
        ]);
    });
});

describe("absoluteUrl", () => {
    it("resolves root-relative and path-relative hrefs against the store", () => {
        expect(absoluteUrl("/x/p/itm1?pid=2", "https://www.flipkart.com")).toBe("https://www.flipkart.com/x/p/itm1?pid=2");
        expect(absoluteUrl("sports-shoes/puma/32588864/buy", "https://www.myntra.com")).toBe(
            "https://www.myntra.com/sports-shoes/puma/32588864/buy"
        );
    });

    it("rejects empty and non-http links", () => {
        expect(absoluteUrl(null, "https://www.flipkart.com")).toBeNull();
        expect(absoluteUrl("", "https://www.flipkart.com")).toBeNull();
        expect(absoluteUrl("javascript:alert(1)", "https://www.flipkart.com")).toBeNull();
    });
});

describe("toSlug", () => {
    it("turns a free-text query into Myntra's path form", () => {
        expect(toSlug("Running Shoes")).toBe("running-shoes");
        expect(toSlug("  men's  T-Shirts! ")).toBe("men-s-t-shirts");
        expect(toSlug("!!")).toBe("");
    });
});


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