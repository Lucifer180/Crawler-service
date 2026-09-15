import app from "./app";
import BrowserManager from "./browser/browserManager";
import { logger } from "./utils/logger";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await BrowserManager.initialize();

        app.listen(PORT, () => {
            logger.info({ port: PORT }, "crawler server started");
        });
    } catch (err) {
        logger.error({ err }, "failed to start server");
        process.exit(1);
    }
}

const shutdown = async () => {
    logger.info("shutting down");

    await BrowserManager.close();

    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();