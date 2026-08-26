import { Product } from "../types/Product";

export class ProductValidator {
    static isValid(
        product: Product
    ) {

        return (

            product.title.length > 0 &&

            product.price > 0

        );

    }
}