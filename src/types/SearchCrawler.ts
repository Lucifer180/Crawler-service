import { Product } from "./Product";

export interface SearchCrawler {
    search(query: string): Promise<Product[]>;
}