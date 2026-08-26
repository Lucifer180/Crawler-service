import { Product } from "../types/Product";
import { Similarity } from "./similarity";

export class ProductMatcher {
    static group(products: Product[]) {
        const groups: Product[][] = [];

        for (const product of products) {
            let matched = false;

            for (const group of groups) {
                const score = Similarity.score(product.title, group[0].title);

                if (score >= 0.6) {
                    group.push(product);
                    matched = true;
                    break
                }
                if (!matched) {

                    groups.push([product]);

                }
                return groups;
            }
        }
    }
}