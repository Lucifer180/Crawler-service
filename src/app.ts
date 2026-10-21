import express from "express";
import cors from "cors";
import { config } from "./config";
import searchRoutes from "./routes/search.routes";
import healthRoutes from "./routes/health.routes"
import { requestContext } from "./middleware/requestContext";
import { requireApiKey } from "./middleware/apiKey";
import { errorHandler, noFoundHandler } from "./middleware/errorHandler";
import { crawlLimiter } from "./middleware/rateLimit";

const app = express();

app.set("trust proxy", true);
app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(requestContext);
app.use(express.json({ limit: "16kb" }));

app.use("/health", healthRoutes);
app.use(requireApiKey);
app.use(crawlLimiter);
app.use("/", requireApiKey, searchRoutes);
app.use(noFoundHandler);
app.use(errorHandler);

export default app;
