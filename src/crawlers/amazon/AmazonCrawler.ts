import { BaseCrawler } from "../BaseCrawler";
import { Product } from "../../types/Product";
import { ProductDetails } from "../../types/ProductDetails";
import { withSession } from "../../browser/withSession";
import { AmazonFetcher } from "./amazonFetcher";
import { AmazonParser } from "./amazon.parser";

export class AmazonCrawler implements BaseCrawler {
    readonly platform = "amazon";

    private fetcher = new AmazonFetcher();

    private parser = new AmazonParser();

    // Through withSession like the other crawlers: it respects the concurrency
    // queue and closes the context even when parsing throws (the old version
    // leaked a browser context on every failed parse).
    async search(query: string): Promise<Product[]> {
        return withSession(() => this.fetcher.search(query), page => this.parser.parse(page));
    }

    async getProduct(url: string): Promise<ProductDetails> {
        throw new Error("not implemented")
    }
}
