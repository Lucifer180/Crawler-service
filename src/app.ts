import express from "express";
import cors from "cors";
import { config } from "./config";
import searchRoutes from "./routes/search.routes";
import healthRoutes from "./routes/health.routes"
import { requestContext } from "./middleware/requestContext";
import { errorHandler, noFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.set("trust proxy", true);
app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(express.json());
app.use(requestContext);
app.use(express.json({ limit: "16kb" }));
app.use("/", searchRoutes);
app.use("/health", healthRoutes)
app.use(noFoundHandler);
app.use(errorHandler);

export default app;