import User from "../models/User.js";
import redis from "../config/redis.js";

export const createUser = async (userData) => {
    const user = await User.create(userData);
    await redis.del("users"); 
    await redis.set(`user:${user.id}`, JSON.stringify(user)); 
    return user;
};

export const getUsers = async () => {
    const cachedUsers = await redis.get("users");
    if (cachedUsers) {
        console.log("Get users from cache Redis");
        return JSON.parse(cachedUsers);
    }

    const users = await User.findAll();
    await redis.set("users", JSON.stringify(users), "EX", 3600); 
    return users;
};

export const getUserById = async (id) => {
    const cachedUser = await redis.get(`user:${id}`);
    if (cachedUser) {
        console.log("Get user from cache Redis");
        return JSON.parse(cachedUser);
    }
    const user = await User.findByPk(id);
    if (user) {
        await redis.set(`user:${id}`, JSON.stringify(user));
    }
    return user;
};
