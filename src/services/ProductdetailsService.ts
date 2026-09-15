import { CrawlQueue } from "../queue/CrawleQueue";
import crawlerRegister from "../registry/crawler.register"
import { Logger, logger } from "../utils/logger";
import { BadRequestError } from "../errors/AppError";
import { ProductDetails } from "../types/ProductDetails";
import { SingleFlight } from "../utils/SingleFlight";
import productCache from "../cache/productCache";

export interface GetProductDetailsOptions {
    log?: Logger;
};

const inflight = new SingleFlight<ProductDetails>()

export async function getProductDetails(platform: string, url: string, options?: GetProductDetailsOptions) {


    const log = options?.log ?? logger
    const crawler = crawlerRegister.getPlatform(platform);

    if (!crawler) {
        throw new Error("Platform not supported");
    };

    const key = `${platform}:${url}`;

    const cached = await productCache.get(key);

    if (cached) {
        log.debug({ key }, "details cache hit");
        return cached;
    }

    if (options?.log) {
        options.log.info({ platform, url }, "fetching product details");
    }

    return inflight.run(key, async () => {
        const raced = await productCache.get(key);

        if (raced) return raced;

        log.info({ platform, url }, "details cache miss,crawling");

        const details = await crawler.getProduct(url);

        await productCache.set(key, details);

        return details;
    })
}