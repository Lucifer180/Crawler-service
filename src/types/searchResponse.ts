import { ProductGroup } from "./ProductGroup";

export interface SearchResult {
    query: string;
    total: number;
    groups: ProductGroup[];
}