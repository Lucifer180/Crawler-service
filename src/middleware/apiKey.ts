import { timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { UnauthorizedError } from "../errors/AppError";

const keys = config.API_KEYS.map(key => Buffer.from(key));

function matches(candidate: string): boolean {
    const given = Buffer.from(candidate);
    // timingSafeEqual throws on length mismatch, so compare lengths first.
    return keys.some(key => key.length === given.length && timingSafeEqual(key, given));
}

/**
 * Every crawl spins up a browser session, so the crawl routes must not be open
 * to anyone who can reach the port. An empty API_KEYS list disables the check,
 * but only outside production.
 */
export function requireApiKey(req: Request, _res: Response, next: NextFunction) {
    if (keys.length === 0 && !config.isProduction) return next();

    const candidate = req.header("x-api-key");
    if (!candidate || !matches(candidate)) return next(new UnauthorizedError());

    next();
}
