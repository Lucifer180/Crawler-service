export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        message: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = new.target.name;
        Error.captureStackTrace?.(this, new.target);
    }
};

export class BadRequestError extends AppError{
     constructor(message: string, details?: unknown) {
        super(400, "BAD_REQUEST", message, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Missing or invalid API key") {
        super(401, "UNAUTHORIZED", message);
    }
};

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, "NOT_FOUND", message);
    }
}

export class TooBusyError extends AppError {
    constructor(message = "Crawler is at capacity, retry shortly") {
        super(503, "TOO_BUSY", message);
    }
}

export class UpstreamError extends AppError {
    constructor(platform: string, message: string, details?: unknown) {
        super(502, "UPSTREAM_FAILED", `${platform}: ${message}`, details);
    }
}

export class UpstreamTimeoutError extends AppError {
    constructor(platform: string) {
        super(504, "UPSTREAM_TIMEOUT", `${platform} did not respond in time`);
    }
}