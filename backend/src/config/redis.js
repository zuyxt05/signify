import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

let redis;

if (process.env.REDIS_URL) {
  // Production: Use connection string (Redis Cloud / Render Redis)
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: process.env.REDIS_URL.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
  });
} else {
  // Local development: Use individual env vars
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || "mystrongpassword",
    maxRetriesPerRequest: null,
  });
}

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

export default redis;

