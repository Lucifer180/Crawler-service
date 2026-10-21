import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { getProduct } from "../controllers/details.controller";
// import { requireApiKey } from "../middleware/apiKey";
const router = Router();

router.get("/search", searchController);

router.post("/details", getProduct);

export default router;

