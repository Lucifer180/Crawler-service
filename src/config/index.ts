import { z } from "zod";

const csv = (value: string) => value.split(",").map(part => part.trim()).filter(Boolean);

const schema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),

    // Playwright
    HEADLESS: z.enum(["true", "false"]).default("true"),
    NAV_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
    MAX_CONCURRENT_SESSIONS: z.coerce.number().int().positive().default(3),
    // How deep the backlog may get before new callers are shed with a 503.
    MAX_QUEUE_DEPTH: z.coerce.number().int().positive().default(20),
    // Watchdog on a crawl that has already started.
    CRAWL_TIMEOUT_MS: z.coerce.number().int().positive().default(90_000),
    BLOCK_HEAVY_RESOURCES: z.enum(["true", "false"]).default("true"),

    // Cache
    CACHE_TTL_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    CACHE_MAX_ENTRIES: z.coerce.number().int().positive().default(500),

    // Observability
    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace"])
        .default("info"),

    // Access control
    API_KEYS: z.string().default(""),
    CORS_ORIGINS: z.string().default("*")
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    // Deliberately console.error, not logger: the logger needs config to exist.
    console.error("Invalid environment configuration:");
    for (const issue of parsed.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
}

const raw = parsed.data;
export const config = {
    ...raw,
    HEADLESS: raw.HEADLESS === "true",
    BLOCK_HEAVY_RESOURCES: raw.BLOCK_HEAVY_RESOURCES === "true",
    API_KEYS: csv(raw.API_KEYS),
    CORS_ORIGINS: "*" ,
    //  raw.CORS_ORIGINS === "*" ? "*" : csv(raw.CORS_ORIGINS),
    isProduction: raw.NODE_ENV === "production",
    isTest: raw.NODE_ENV === "test"
};

export type config = typeof config;