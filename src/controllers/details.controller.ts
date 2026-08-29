import { Request, Response } from "express";
import { getProductDetails } from "../services/ProductdetailsService";
import productCache from "../cache/productCache";

export async function getProduct(req: Request, res: Response) {
    const { platform, url } = req.body;

    const cached = productCache.get(url);

    if (cached) {
        console.log("[CACHE HIT]", url);
        return res.json(cached);
    }

    console.log("[CACHE MISS]", url);

    const product = await getProductDetails(platform, url);

    // Save in cache
    productCache.set(url, product);

    return res.json(product);
}