import { Request, Response } from "express";
import { getProductDetails } from "../services/ProductdetailsService";
import productCache from "../cache/productCache";
import { assertAllowedUrl, detailsBodySchema, parseOrThrow } from "../validators/schemas";

export async function getProduct(req: Request, res: Response) {
    const { platform, url } = parseOrThrow(detailsBodySchema, req.body);
    
    const safeUrl = assertAllowedUrl(platform, url);

    const cached = productCache.get(safeUrl);
    if (cached) {
        req.log.info({ url: safeUrl }, "cache hit");
        return res.json(cached);
    }

    req.log.info({ url: safeUrl }, "cache miss");
    const details = await getProductDetails(platform, safeUrl, { log: req.log });

    productCache.set(safeUrl, details);

    return res.json(details);
}