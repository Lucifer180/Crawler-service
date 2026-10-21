import { describe, expect, it, vi } from "vitest";
import { MemoryCache } from "../../cache/memoryCache";


describe("MemoryCache", () => {
    it("expires entries after the TTL", async () => {
        vi.useFakeTimers();

        const cache = new MemoryCache<string>(1000, 10);
        await cache.set("k", "v");

        expect(await cache.get("k")).toBe("v");

        vi.advanceTimersByTime(1001);

        expect(await cache.get("k")).toBeUndefined();

        vi.useRealTimers();
    });

    it("evicts the least recently used entry at capacity", async () => {
        const cache = new MemoryCache<string>(60_000, 2);

        await cache.set("a", "1");
        await cache.set("b", "2");

        // Touch "a" so "b" becomes the least recently used.
        await cache.get("a");

        await cache.set("c", "3");

        expect(await cache.get("b")).toBeUndefined();
        expect(await cache.get("a")).toBe("1");
        expect(cache.stats().evictions).toBe(1);
    });
});