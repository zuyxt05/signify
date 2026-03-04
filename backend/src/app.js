import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { apiLimiter, authLimiter } from "../middlewares/rateLimiter.js";
import errorMiddleware from "../middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

// Parse allowed origins from env (comma-separated) + always allow localhost for dev
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.REACT_API ? process.env.REACT_API.split(",").map(s => s.trim()) : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "ngrok-skip-browser-warning"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(express.json({ limit: "1mb" }));

// Public health-check route (no auth, no rate limit) — keep server alive
app.get("/ping", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Apply rate limiters
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.use("/api", routes);

// Global error handler (must be after routes)
app.use(errorMiddleware);

export default app;

