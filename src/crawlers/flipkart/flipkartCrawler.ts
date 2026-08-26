import { BaseCrawler } from "../BaseCrawler";;
import { Product } from "../../types/Product";
import { ProductDetails } from "../../types/ProductDetails";

import { FlipkartFetcher } from "./flipkartFetcher";
import { FlipKartParser } from "./flipkartParser";


export class FlipkartCrawler implements BaseCrawler {
    readonly platform = "flipkart";

    private fetcher = new FlipkartFetcher();

    private parser = new FlipKartParser();

    async search(query: string): Promise<Product[]> {

        const { page, context } = await  this.fetcher.search(query);

        const products = await this.parser.parse(page);

        await context.close();

        return products;
    };

    async getProduct(url: string): Promise<ProductDetails> {
        throw new Error("Not implemented");
    }
}