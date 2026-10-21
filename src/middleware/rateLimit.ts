import rateLimit from "express-rate-limit";

export const crawlLimiter = rateLimit({
    windowMs:60_000,
    limit:30,
    standardHeaders:"draft-7",
     legacyHeaders: false,
    keyGenerator: req => req.header("x-api-key") ?? req.ip ?? "anonymous",
    message: {
        error: { code: "RATE_LIMITED", message: "Too many requests, slow down" }
    }
})