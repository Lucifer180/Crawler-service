import { Router } from "express";
import BrowserManager from "../browser/browserManager";

const router = Router();

const startedAt = Date.now();

router.get("/live", (req, res) => {
    res.json({ status: "ok", uptimeSeconds: Math.round((Date.now() - startedAt)) });
});

router.get("/ready", (req, res) => {
    const browserUp = BrowserManager.isHealthy();

    res.status(browserUp ? 200 : 503).json({
        status: browserUp ? "ready" : "degraded",
        browser: browserUp ? "connected" : "disconnected"
    });
});

router.get("/", (_req, res) => res.json({ status: "ok" }));
export default router;