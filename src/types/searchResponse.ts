import { ProductGroup } from "./ProductGroup";

export interface SourceReport {
    platform: string;
    status: "ok" | "failed",
    count: number;
    durationMs: number;
    error?: string
}

export interface SearchResult {
    query: string;
    total: number;
    groups: ProductGroup[];
    sources: SourceReport[];
}
