import { Request, Response } from "express";
import crawlerRegister from "../registry/crawler.register";

export async function getProduct(req: Request, res: Response) {
    const { platform, url } = await req.body;

    const crawler = crawlerRegister.getPlatform(platform);

    if (!crawler) {
        return res.status(404).json({
            message: "crawler not found"
        });
    };

    const product = await crawler.getProduct(url);

    res.json(product);
}