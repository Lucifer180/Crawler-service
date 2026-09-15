// tests/http/search.test.ts
import { describe, expect, it, vi } from "vitest";
import request from "supertest";

// Stub the orchestrator so the HTTP test never launches a browser.
vi.mock("../../orchestrator/search.orchestrator", () => ({
    searchProducts: vi.fn(async (query: string) => ({
        query,
        total: 0,
        sources: [{ platform: "flipkart", status: "ok", count: 0, durationMs: 5 }],
        groups: []
    }))
}));

import app from "../../app";

describe("GET /search", () => {
    it("rejects a missing query with a structured 400", async () => {
        const res = await request(app).get("/search").set("x-api-key", "test-key");

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("BAD_REQUEST");
        expect(res.body.error.details[0].field).toBe("q");
    });

    it("returns results for a valid query", async () => {
        const res = await request(app)
            .get("/search?q=shirt")
            .set("x-api-key", "test-key");

        expect(res.status).toBe(200);
        expect(res.body.query).toBe("shirt");
        expect(res.body.sources).toHaveLength(1);
    });
});

describe("POST /details", () => {
    it("refuses a URL that does not belong to the platform", async () => {
        const res = await request(app)
            .post("/details")
            .set("x-api-key", "test-key")
            .send({ platform: "flipkart", url: "http://169.254.169.254/computeMetadata/v1/" });

        expect(res.status).toBe(400);
        expect(res.body.error.message).toMatch(/not a valid flipkart url/i);
    });
});