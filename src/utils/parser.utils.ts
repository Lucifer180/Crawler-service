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