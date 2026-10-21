import { z } from "zod";
import { BadRequestError } from "../errors/AppError";

export const searchQuerySchema = z.object({
    q: z.string().trim().min(2, "q must be atlease 2 characters").max(120),
    limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const detailsBodySchema = z.object({
    platform: z.enum(["flipkart", "myntra", "amazon"]),
    url: z.string().url()
});

const ALLOWED_HOSTS: Record<string, string[]> = {
    flipkart: ["flipkart.com", "flixcart.com"],
    myntra: ["myntra.com"],
    amazon: ["amazon.in"]
};

export function assertAllowedUrl(platform: string, raw: string): string {
    let parsed: URL;

    try {
        parsed = new URL(raw);
    } catch (error) {
        throw new BadRequestError("url must be an absolute http(s) URL");
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new BadRequestError(`Unsupported protocol ${parsed.protocol}`);
    };

    const host = parsed.hostname.toLowerCase();
    const allowed = ALLOWED_HOSTS[platform] ?? [];

    const ok = allowed.some(domain => host == domain || host.endsWith(`.${domain}`));

    if (!ok) {
        throw new BadRequestError(`Host "${host}" is not a valid ${platform} URL`);
    };

    parsed.username = "";
    parsed.password = "";
    parsed.hash = "";

    return parsed.toString();
};

export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);

    if (!result.success) {
        throw new BadRequestError("Invalid Request", result.error.issues.map(i => ({
            field: i.path.join(".") || "(root)",
            message: i.message
        })))
    }
    return result.data;
}