import pino from "pino";
import { config } from "../config";
const SEVERITY: Record<string, string> = {
    trace: "DEBUG",
    debug: "DEBUG",
    info: "INFO",
    warn: "WARNING",
    error: "ERROR",
    fatal: "CRITICAL"
};

export const logger = pino({
    level: config.LOG_LEVEL,
    base: { service: "crawler-service" },
    messageKey: "message",
    formatters: {
        level(label) {
            return { severity: SEVERITY[label] ?? "DEFAULT", level: label }
        }
    },
    redact: {
        paths: ["req.headers['x-api-key']", "req.headers.authorization"],
        censor: "[redacted]"
    }
})
export type Logger = typeof logger;