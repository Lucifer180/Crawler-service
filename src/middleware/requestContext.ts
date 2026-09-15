import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { logger, Logger } from "../utils/logger";


declare global {
    namespace Express {
        interface Request {
            id: string,
            log: Logger
        }
    }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
    req.id = (req.header("x-request-id") ?? randomUUID()).slice(0, 64);
    req.log = logger.child({ requestId: req.id });

    res.setHeader("x-request-id", req.id);

    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        req.log.info({
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: Math.round(durationMs)
        },
            "request completed"
        )
    });
    next();
}