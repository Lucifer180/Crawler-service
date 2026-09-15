// tests/parsers/flipkartDetails.test.ts
import { afterAll, describe, expect, it } from "vitest";
import { closeBrowser, pageFromFixture } from "../helpers/fixturePage";
import { FlipkartDetailsParser } from "../../crawlers/flipkart/FlipkartDetailsParser";

afterAll(closeBrowser);

describe("FlipkartDetailsParser", () => {
    it("extracts a product from the fk-lite layout", async () => {
        const page = await pageFromFixture("flipkart-pdp-lite.html");

        const details = await FlipkartDetailsParser.parse(page);

        expect(details.title).toContain("vivo Y31t 5G");
        expect(details.brand).toBe("vivo");
        expect(details.price).toBe(29999);
        expect(details?.images?.length).toBeGreaterThanOrEqual(5);
        expect(details.image).toMatch(/^https:\/\//);
        expect(details.colors).toContain("Seashore Green");
        expect(details.availability).toBe(false);

        await page.close();
    });

    // The single most valuable scraper test: not "is field X exactly Y", but
    // "did the page give us anything at all". This is what fires the day a
    // site ships a redesign.
    it("never returns a fully empty product from a real page", async () => {
        const page = await pageFromFixture("flipkart-pdp-lite.html");

        const details = await FlipkartDetailsParser.parse(page);

        const populated = [
            details.title,
            details.brand,
            details.image,
            details.price > 0 ? "price" : ""
        ].filter(Boolean);

        expect(populated.length).toBeGreaterThanOrEqual(4);

        await page.close();
    });
});