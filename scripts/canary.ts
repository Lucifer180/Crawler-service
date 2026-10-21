// scripts/canary.ts
/**
 * Hits the real sites and asserts the parsers still find fields.
 *
 * Run this on a schedule, NOT in CI on every push: it makes live requests, so
 * it is slow, flaky under rate limits, and unkind to the target sites.
 * Its job is to tell you a selector rotted before a user does.
 */
import BrowserManager from "../src/browser/browserManager";
import registry from "../src/registry/crawler.register";
import { logger } from "../src/utils/logger";

const PROBES = [
    { platform: "flipkart", query: "iphone" },
    { platform: "myntra", query: "shirt" },
    { platform: "amazon", query: "laptop" }
];

async function main() {
    await BrowserManager.initialize();

    let failures = 0;

    for (const probe of PROBES) {
        const crawler = registry.getPlatform(probe.platform);
        if (!crawler) continue;

        try {
            const products = await crawler.search(probe.query);

            const withTitle = products.filter(p => p.title).length;
            const withPrice = products.filter(p => p.price > 0).length;

            const healthy = products.length >= 5 && withPrice / products.length > 0.8;

            logger[healthy ? "info" : "error"](
                { ...probe, found: products.length, withTitle, withPrice },
                healthy ? "canary ok" : "canary DEGRADED"
            );

            if (!healthy) failures++;
        } catch (error) {
            logger.error({ ...probe, err: error }, "canary FAILED");
            failures++;
        }
    }

    await BrowserManager.close();
    process.exit(failures > 0 ? 1 : 0);
}

main();