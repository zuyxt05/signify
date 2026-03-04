import { registerUser, loginUser, generateToken } from "../services/authService.js";
import redis from "../config/redis.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await registerUser(name, email, password);
        // Return user without password
        const { password: _, ...safeUser } = user.toJSON();
        res.status(201).json(safeUser);
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await loginUser(email, password);

        res.json({ message: "Login successful", user, token });
    } catch (err) {
        console.log(err)
        res.status(401).json({ error: err.message });
    }
};

export const logout = async (req, res) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) return res.status(400).json({ message: "No token provided" });

        const token = authHeader.split(" ")[1];
        // Blacklist token in Redis (expires in 24h to match JWT expiry)
        await redis.set(`blacklisted:${token}`, "true", "EX", 86400);

        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
