export interface CacheStats {
    hits: number;
    misses: number;
    entries: number;
    evictions: number;
};

export interface CacheStore<T> {
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear?(): Promise<void>;
    stats(): CacheStats;
}