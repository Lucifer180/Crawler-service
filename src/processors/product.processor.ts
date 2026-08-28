import { Product } from "../types/Product";

export class ProductProcessor {
    static process(products: Product[]): Product[] {
     
        return products
            .filter(p => p.price > 0).filter(p => p.title.length > 0)
            // .slice(0, 20);
            
    }
}