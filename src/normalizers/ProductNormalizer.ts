import crypto from "crypto";

import { RawProduct } from "../types/RawProduct";
import { Product } from "../types/Product";

export class ProductNormalizer {
    static normalize(raw: RawProduct, platform: string): Product {
        return {
            id: crypto.randomUUID(),
            title: raw.title.trim(),
            brand: raw.brand?.trim() ?? "",
            price: Number(
                raw.price.replace(/[^\d]/g, "")
            ),

            image: raw.image ?? "",

            url: raw.url ?? "",

            platform
        }
    }
}