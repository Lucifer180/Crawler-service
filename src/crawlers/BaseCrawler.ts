import { Product } from "../types/Product";
import { ProductDetails } from "../types/ProductDetails";

export interface BaseCrawler {
    readonly platform: string;
    search(query: string): Promise<Product[]>;
    getDetails?(url: string): Promise<Product>;
    getProduct(url: string): Promise<ProductDetails>;
}