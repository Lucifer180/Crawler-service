import { Product } from "../types/Product";

export class DuplicateService {
    // static remove(products: Product[]) {
    //     const map = new Map<string, Product>();

    //     for (const product of products) {
    //         const key = product.title.toLowerCase().trim();

    //         if (!map.has(key)) {
    //             map.set(key, product);
    //         }
    //     }
    //     return [...map.values()];
    // }

    static remove(products: Product[]) {
        const map = new Map<string, Product>();

        for (const product of products) {
            const key = product.title.toString().trim();

            if (!map.has(key)) {
                map.set(key, product);
            }
        }
        return [...map.values()]
    }
}