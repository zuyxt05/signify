import dotenv from "dotenv";
dotenv.config();

/**
 * Simple in-memory rate limiter (no external dependencies)
 * For production, consider using Redis-based rate limiting
 */
const createRateLimiter = ({ windowMs = 60000, max = 100, message = "Too many requests, please try again later." } = {}) => {
    const requests = new Map(); // Map<ip, { count, resetTime }>

    // Periodically clean up expired entries
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of requests.entries()) {
            if (now > data.resetTime) {
                requests.delete(key);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress || "unknown";
        const now = Date.now();
        const record = requests.get(ip);

        if (!record || now > record.resetTime) {
            // New window
            requests.set(ip, { count: 1, resetTime: now + windowMs });
            res.set("X-RateLimit-Limit", max);
            res.set("X-RateLimit-Remaining", max - 1);
            return next();
        }

        record.count++;

        if (record.count > max) {
            res.set("X-RateLimit-Limit", max);
            res.set("X-RateLimit-Remaining", 0);
            res.set("Retry-After", Math.ceil((record.resetTime - now) / 1000));
            return res.status(429).json({ error: message });
        }

        res.set("X-RateLimit-Limit", max);
        res.set("X-RateLimit-Remaining", max - record.count);
        next();
    };
};

// General API rate limiter: 100 requests per minute
export const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests. Please try again in a minute.",
});

// Auth rate limiter: 10 attempts per 15 minutes (prevent brute force)
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again in 15 minutes.",
});
