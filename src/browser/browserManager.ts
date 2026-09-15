import { Browser, chromium, Page } from "playwright";
import dotenv from "dotenv";
import { CrawlerSession } from "../types/CrawlerSession"
import { logger } from "../utils/logger";
import { config } from "../config";
dotenv.config();

class BrowserManager {
    private browser: Browser | null = null;

    async initialize():Promise<void> {
        if (this.browser) return;

        this.browser = await chromium.launch({
            headless: config.HEADLESS,
            args: [
                // Chromium's sandbox needs kernel privileges most containers do
                // not grant. Without this it refuses to start under Docker.
                "--no-sandbox",
                "--disable-setuid-sandbox",

                // Docker gives /dev/shm 64 MB. Chromium uses it for shared memory
                // between its processes and crashes tabs when it runs out. This is
                // the single most common "works locally, dies in the container",
                // and the symptom looks like a random tab crash, not a config bug.
                "--disable-dev-shm-usage",

                "--disable-blink-features=AutomationControlled",
                "--disable-infobars"
            ]
        })
        this.browser.on("disconnected", () => {
            {
                logger.error("chromium disconnected");
                this.browser = null;
            }
        });
        logger.info("chromium started");
    };

    async createSession(): Promise<CrawlerSession> {
        if (!this.browser) {
            throw new Error("Browser not initialized");
        };

        const context = await this.browser.newContext();
        const page = await context.newPage();

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
            // dispose: async () => {
            //     await page.close();
            //     await context.close();
            // }
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

    isHealthy(): boolean {
        return this.browser !== null && this.browser.isConnected();
    }

};

export default new BrowserManager();
