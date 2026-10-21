import { Locator } from "playwright";

export async function safeText(locator: Locator): Promise<string> {
    try {
        return (await locator.textContent())?.trim() ?? "";
    } catch (error) {
        return "";
    }
};

export async function getAttribute(locator: Locator, attribute: string): Promise<string> {
    try {
        return (await locator.getAttribute(attribute)) ?? "";
    } catch (error) {
        return "";
    }
}
/**
 * Resolves a scraped href ("/p/123", "sports-shoes/x/123/buy", or absolute)
 * against the store's origin. Returns null for empty or non-http(s) links.
 */
export function absoluteUrl(href: string | null | undefined, base: string): string | null {
    if (!href) return null;

    try {
        const url = new URL(href, base.endsWith("/") ? base : `${base}/`);
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
        return null;
    }
}

/** "Running Shoes!" -> "running-shoes": the path form Myntra's listing pages use. */
export function toSlug(query: string): string {
    return query
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
