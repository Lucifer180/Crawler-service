import { BaseCrawler } from "../BaseCrawler";
import { Product } from "../../types/Product";
import { ProductDetails } from "../../types/ProductDetails";
import { AmazonFetcher } from "./amazonFetcher";
import { AmazonParser } from "./amazon.parser";

export class AmazonCrawler implements BaseCrawler {
    getDetails(url: string): Promise<Product> {
        throw new Error("Method not implemented.");
    }
    readonly platform = "amazon";

    private fetcher = new AmazonFetcher();

    private parser = new AmazonParser();

    async search(query: string): Promise<Product[]> {
        const { page, context } = await this.fetcher.search(query);

        const products = await this.parser.parse(page);

        await context.close();

        return products;
    }

    async getProduct(url: string): Promise<ProductDetails> {
        throw new Error("not implemented")
    }
}