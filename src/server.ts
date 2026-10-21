// Must load first: config/index.ts parses process.env at import time.
import "dotenv/config";
import app from "./app";
import BrowserManager from "./browser/browserManager";
import { logger } from "./utils/logger";
import { config } from "./config/index";
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await BrowserManager.initialize();

        const server = app.listen(config.PORT, () => {
            logger.info({ port: config.PORT, env: config.NODE_ENV }, "crawler running");
        });
        server.keepAliveTimeout = 620_000;
        server.headersTimeout = 630_000;

        let shuttingDown = false;

        const shutdown = async (signal: string) => {
            if (shuttingDown) return;

            shuttingDown = true;

            const killTimer = setTimeout(() => {
                logger.error("gracefull shutDown timed out,forcing exit");
                process.exit(1);
            }, 8_000);
            killTimer.unref();
            server.close(async () => {
                await BrowserManager.close().catch(() => { });
                clearTimeout(killTimer);
                logger.info("shutdown complete");
                process.exit(0);
            });
        };

        process.on("SIGTERM", () => void shutdown("SIGTERM"));
        process.on("SIGINT", () => void shutdown("SIGINT"));
    } catch (err) {
        logger.error({ err }, "failed to start server");
        process.exit(1);
    }
}

process.on("unhandledRejection", reason => {
    logger.error({ err: reason }, "unhandled promise rejection");
});

process.on("uncaughtException", error => {
    logger.fatal({ err: error }, "uncaught exception, exiting");
    process.exit(1);
});

startServer();