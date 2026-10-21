import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { config } from "../config";
import { logger } from "../utils/logger";

export function noFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: `no router for ${req.method} ${req.path}`,
            requestId: req.id
        }
    })
};

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    const log = req.log ?? logger;

    if (err instanceof AppError) {
        const level = err.statusCode >= 500 ? "error" : "warn";

        log[level]({ err, code: err.code }, err.message);

        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
                requestId: req.id
            }
        })
    };

    log.error({ err }, "unhandled error");

    res.status(500).json({
        error: {
            code: "INTERNAL",
            mesasge: config.isProduction
                ? "something went wrong"
                : String((err as Error)?.message ?? err),
            requestId: req.id
        }
    })
}