import Message from "../models/Message.js";
import redis from "../config/redis.js";

export const sendMessage = async (messageData) => {
    const message = await Message.create(messageData);

    const cacheKey = `messages:${message.meetingId}`;
    await redis.rpush(cacheKey, JSON.stringify(message));  
    await redis.expire(cacheKey, 3600); 

    return message;
};

export const getMessagesByMeeting = async (meetingId) => {
    const cacheKey = `messages:${meetingId}`;
    const cachedMessage = await redis.lrange(cacheKey, 0, -1);
    if (cachedMessage && cachedMessage.length > 0) {
        console.log("Get messages from cache Redis");
        return cachedMessage.map((message) => JSON.parse(message));
    }

    const messages = await Message.findAll({ where: { meetingId } });
    if (messages.length > 0) {
        await redis.rpush(cacheKey, ...messages.map((message) => JSON.stringify(message)));
        await redis.expire(cacheKey, 3600);
    }

    return messages;
};
