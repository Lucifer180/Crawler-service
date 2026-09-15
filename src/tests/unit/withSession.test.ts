import { describe, expect, it, vi } from "vitest";
import { withSession } from "../../browser/withSession";
import { config } from "../../config";


function fakeSession() {
    const context = { close: vi.fn().mockResolvedValue(undefined) };
    return { session: { page: {}, context } as any, context };
}

describe("withSession", () => {
    it("closes the context when the work succeeds", async () => {
        const { session, context } = fakeSession();

        const result = await withSession(async () => session, async () => "ok");

        expect(result).toBe("ok");
        expect(context.close).toHaveBeenCalledTimes(1);
    });

    // This is the regression the whole task exists to prevent. Run it against
    // the old crawler code and it fails: close() is never reached.
    it("closes the context when the parser throws", async () => {
        const { session, context } = fakeSession();

        await expect(
            withSession(async () => session, async () => {
                throw new Error("selector rotted");
            })
        ).rejects.toThrow("selector rotted");

        expect(context.close).toHaveBeenCalledTimes(1);
    });

    it("never runs more than the configured concurrency at once", async () => {
        let running = 0;
        let peak = 0;

        const task = () =>
            withSession(
                async () => fakeSession().session,
                async () => {
                    running++;
                    peak = Math.max(peak, running);
                    await new Promise(resolve => setTimeout(resolve, 20));
                    running--;
                }
            );

        await Promise.all(Array.from({ length: 8 }, task));

        expect(peak).toBeLessThanOrEqual(config.MAX_CONCURRENT_SESSIONS);
    });
});