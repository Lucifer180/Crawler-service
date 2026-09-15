

export class SingleFlight<T> {
    private readonly inflight = new Map<string, Promise<T>>();

    run(key: string, fn: () => Promise<T>): Promise<T> {
        const existing = this.inflight.get(key);

        if (existing) return existing;

        const promise = Promise.resolve().then(fn).finally(() => {
            this.inflight.delete(key);
        });
        this.inflight.set(key, promise);
        return promise;
    };

    get size(): number {
        return this.inflight.size;
    }
}