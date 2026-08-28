import { Request, Response } from "express";
import crawlerRegister from "../registry/crawler.register";
import { getProductDetails } from "../services/ProductdetailsService";

export async function getProduct(req: Request, res: Response) {
    const { platform, url } = await req.body;

    const product = await getProductDetails(platform, url);

    res.json(product);
}