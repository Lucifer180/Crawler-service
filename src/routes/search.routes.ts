import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { getProduct } from "../controllers/details.controller";

const router = Router();

router.get("/search", searchController);

router.post("/details", getProduct);

export default router;

