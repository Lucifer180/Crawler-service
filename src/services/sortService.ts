import { Product } from "../types/Product";

export class SortService {
    static byPrice(products: Product[]) {
        return [...products].sort((a, b) => a.price - b.price);
    }
}