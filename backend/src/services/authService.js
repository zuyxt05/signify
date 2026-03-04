import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import redis from "../config/redis.js";

dotenv.config();

export const registerUser = async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.create({ name, email, password: hashedPassword })
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid email or password"); 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = generateToken(user);
    await redis.set(`user:${user.id}:token`, token, "EX", 86400);

    return { user, token };
};

export const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { 
        expiresIn: "24h",
    });
};
