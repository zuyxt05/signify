import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../src/config/redis.js"; 

dotenv.config();


export const authenticate = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; 
    try {
        const isBlacklisted = await redis.get(`blacklisted:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized: Token has been revoked" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        let errorMessage = "Unauthorized: Invalid token";
        if (error.name === "TokenExpiredError") {
            errorMessage = "Unauthorized: Token has expired";
        }
        return res.status(401).json({ message: errorMessage });
    }
};


