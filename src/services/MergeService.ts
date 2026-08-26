import { Product } from "../types/Product";

export class MergeService {
    static merge(results: Product[][]): Product[] {
        return results.flat();
    }
}