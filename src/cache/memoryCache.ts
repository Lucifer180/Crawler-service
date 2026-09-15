import { CacheStats, CacheStore } from './CacheStore';

interface Entry<T> {
    value: T;
    expiresAt: number
};

export class MemoryCache<T> implements CacheStore<T> {
    private readonly map = new Map<string, Entry<T>>();

    private hits = 0;
    private misses = 0;
    private evictions = 0;

    constructor(private readonly defaultTtMs: number, private readonly maxEntries: number) { };

    async get(key: string): Promise<T | undefined> {
        const entry = this.map.get(key);

        if (!entry) {
            this.misses++;
            return undefined;
        };

        if (entry.expiresAt <= Date.now()) {
            this.map.delete(key);
            this.misses++;
            return undefined;
        };

        this.map.delete(key);
        this.map.set(key, entry);

        this.hits++;
        return entry.value
    };

    async set(key: string, value: T, ttlMs = this.defaultTtMs): Promise<void> {
        if (this.map.has(key)) {
            this.map.delete(key);
        };

        this.map.set(key, { value, expiresAt: Date.now() + ttlMs });

        while (this.map.size > this.maxEntries) {
            const oldest = this.map.keys().next().value;
            if (oldest == undefined) break;
            this.map.delete(oldest);
            this.evictions++;
        }
    };

    async delete(key: string): Promise<void> {
        this.map.delete(key);
    }


    stats(): CacheStats {
        return {
            hits: this.hits,
            misses: this.misses,
            entries: this.map.size,
            evictions: this.evictions
        };
    }

}