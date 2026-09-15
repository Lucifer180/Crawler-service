import { BaseCrawler } from "../BaseCrawler";
import { Product } from "../../types/Product";
import { ProductDetails } from "../../types/ProductDetails"
import { MyntraFetcher } from "./MyntraFetcher";
import { MyntraParser } from "./MyntraParser";
import { MyntraDetailsParser } from "./MyntraDetailsParser";
import { withSession } from "../../browser/withSession";
import { FlipKartParser } from "../flipkart/flipkartParser";

export class MyntraCrawler implements BaseCrawler {
    readonly platform = "myntra";

    private fetcher = new MyntraFetcher();

    private parser = new MyntraParser();

    async search(query: string): Promise<Product[]> {
        // const { page, context } = await this.fetcher.search(query);

        // const products = await this.parser.parse(page);

        // await context.close();

        // return products;

        return withSession(()=>this.fetcher.search(query),page=>this.parser.parse(page))
    }

    async getProduct(url: string): Promise<ProductDetails> {
        // const { page, context } = await this.fetcher.getProduct(url);

        // const details = await MyntraDetailsParser.parse(page);

        // await context.close();

        // return details;

        return withSession(()=>this.fetcher.getProduct(url),page=>MyntraDetailsParser.parse(page))

    }
}