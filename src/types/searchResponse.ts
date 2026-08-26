import { Product } from "./Product";

export interface SearchResult {
    query: string,
    platform: string,
    products: Product[]
}