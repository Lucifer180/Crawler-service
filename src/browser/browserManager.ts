import { Browser, chromium, Page } from "playwright";
import dotenv from "dotenv";
import { CrawlerSession } from "../types/CrawlerSession"

dotenv.config();

class BrowserManager {
    private browser: Browser | null = null;

    async init() {
        if (this.browser) {
            return;
        };

        this.browser = await chromium.launch({
            headless: process.env.HEADLESS === "true",
            args: [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-infobars",
                "--window-size=1920,1080",
            ],
        });

        console.log("chromium started");
    };

    async createSession(): Promise<CrawlerSession> {
        if (!this.browser) {
            throw new Error("Browser not initialized");
        };

        const context = await this.browser.newContext();
        const page = await context.newPage();

        // await context.route("**/*", (route) => {

        //     const type =
        //         route.request().resourceType();

        //     if (
        //         type === "image" ||
        //         type === "font" ||
        //         type === "media"
        //     ) {

        //         return route.abort();

        //     }

        //     route.continue();

        // });
        // Spoof navigator.webdriver to avoid bot detection
        await page.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => undefined });
        });

        // Set a realistic user agent
        await page.setExtraHTTPHeaders({
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        });

        return {
            context,
            page,
            dispose: async () => {
                await page.close();
                await context.close();
            }
        };
    };

    async createContext() {
        if (!this.browser) {
            throw new Error("Browser not initialized");
        };

        return await this.browser.newContext({
            viewport: {
                width: 1366,
                height: 768
            },
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0 Safari/537.36"
        })
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    isRunning() {
        return this.browser !== null
    };


};

export default new BrowserManager();
