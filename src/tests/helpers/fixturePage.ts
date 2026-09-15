// tests/helpers/fixturePage.ts
import fs from "node:fs/promises";
import path from "node:path";
import { Browser, chromium, Page } from "playwright";

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
    if (!browser) browser = await chromium.launch({ headless: true });
    return browser;
}

export async function closeBrowser(): Promise<void> {
    await browser?.close();
    browser = null;
}

/**
 * Load a saved HTML page into a real Chromium page.
 *
 * We use a real browser rather than a DOM shim because the parsers run inside
 * page.evaluate() — they need actual browser semantics. All network is
 * blocked so the fixture cannot re-hydrate, phone home, or navigate away,
 * which is what makes these tests fast and deterministic.
 */
export async function pageFromFixture(name: string): Promise<Page> {
    const html = await fs.readFile(
        path.join(__dirname, "..", "fixtures", name),
        "utf-8"
    );

    const page = await (await getBrowser()).newPage(); 

    await page.route("**/*", route =>
        route.request().resourceType() === "document"
            ? route.continue()
            : route.abort()
    );

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    return page;
}