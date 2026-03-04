/**
 * Global error handling middleware for Express
 * Catches unhandled errors and returns consistent error responses
 */
const errorMiddleware = (err, req, res, next) => {
    console.error("❌ Unhandled Error:", err);

    // CORS errors
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            error: "CORS Error",
            message: "Origin not allowed",
        });
    }

    // Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
        const errors = err.errors.map(e => e.message);
        return res.status(400).json({
            error: "Validation Error",
            errors,
        });
    }

    // Sequelize unique constraint errors
    if (err.name === "SequelizeUniqueConstraintError") {
        const fields = err.errors.map(e => e.path);
        return res.status(409).json({
            error: "Duplicate Entry",
            message: `${fields.join(", ")} already exists`,
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            error: "Authentication Error",
            message: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            error: "Authentication Error",
            message: "Token has expired",
        });
    }

    // JSON parse errors
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "Invalid JSON",
            message: "Request body contains invalid JSON",
        });
    }

    // Payload too large
    if (err.type === "entity.too.large") {
        return res.status(413).json({
            error: "Payload Too Large",
            message: "Request body exceeds the size limit",
        });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error";

    res.status(statusCode).json({
        error: "Server Error",
        message,
    });
};

export default errorMiddleware;
