import { BaseCrawler } from "../BaseCrawler";;
import { Product } from "../../types/Product";
import { ProductDetails } from "../../types/ProductDetails";
import { withSession } from "../../browser/withSession";
import { FlipkartFetcher } from "./flipkartFetcher";
import { FlipKartParser } from "./flipkartParser";
import { FlipkartDetailsParser } from "./FlipkartDetailsParser"


export class FlipkartCrawler implements BaseCrawler {
    readonly platform = "flipkart";

    private fetcher = new FlipkartFetcher();

    private parser = new FlipKartParser();

    async search(query: string): Promise<Product[]> {
        return withSession(() => this.fetcher.search(query), page => FlipKartParser.parse(page))
    };

    async getProduct(url: string): Promise<ProductDetails> {
        return withSession(
            () => this.fetcher.getProduct(url),
            page => FlipkartDetailsParser.parse(page)
        );
    }
}