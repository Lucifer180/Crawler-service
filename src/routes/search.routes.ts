import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { getProduct } from "../controllers/details.controller";

const router = Router();

router.get("/", searchController);

router.post("/product", getProduct);

export default router;

