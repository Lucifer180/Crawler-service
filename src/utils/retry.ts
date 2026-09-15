import { is } from "zod/v4/locales";
import { logger } from "./logger";
import { resolve } from "node:dns";

const TRANSIENT_PATTERNS = [
    /timeout/i,
    /net::ERR_/i,
    /ECONNRESET/i,
    /ECONNREFUSED/i,
    /Navigation failed/i,
    /Target (page|closed)/i,
    /browser has been closed/i
];


export function isTransient(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return TRANSIENT_PATTERNS.some(pattern => pattern.test(message));
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        attempts?: number,
        baseDelayMs?: number,
        label: string,
        retryable?: (error: unknown) => boolean
    }
): Promise<T> {
    const attempts = options.attempts ?? 2;
    const baseDelayMs = options.baseDelayMs ?? 500;
    const retryable = options.retryable ?? isTransient;

    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === attempts || !retryable(error)) throw error;

            const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 250;

            logger.warn({ label: options.label, attempt, delayMs: Math.round(delay) }, "retrying after transient failure");

            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    throw lastError;
}