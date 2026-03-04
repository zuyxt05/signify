import redis from "../config/redis.js";
import { getMeetingById } from "../services/meetingService.js";

let wssInstance;

export function setWebSocketInstance(wss) {
    wssInstance = wss;
}

export async function joinMeeting(ws, data) {
    const { userId, meetingCode } = data;

    //Check meeting existence
    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
        ws.send(JSON.stringify({ type: "error", message: "Meeting không tồn tại" }));
        return;
    }

    // Check user has joined the meeting
    const isMember = await redis.sismember(`meeting:${meetingId}:participants`, userId);
    if (isMember) {
        ws.send(JSON.stringify({ type: "error", message: "User đã tham gia cuộc họp" }));
        return;
    }

    // Save user to Redis
    await redis.sadd(`meeting:${meetingId}:participants`, userId);
    await redis.set(`client:${ws.id}`, JSON.stringify({ userId, meetingId }));

    // Send participant list to users
    const participants = await redis.smembers(`meeting:${meetingId}:participants`);
    ws.send(JSON.stringify({ type: "meeting-info", participants }));

    // Notify other participants about the new user
    const user = await getUserById(userId);
    const username = user ? user.name : "Unknown User";
    await redis.publish(`meeting:${meetingId}`, JSON.stringify({
        type: "user-joined",
        username,
    }));

    console.log(`${username} joined meeting ${meetingId}`);
}

// Send message to all participants in the meeting
export async function broadcastToMeeting(meetingId, message) {
    await redis.publish(`meeting:${meetingId}`, JSON.stringify(message));
}

// Leave meeting and remove user from Redis
export async function leaveMeeting(ws) {
    const clientInfo = await redis.get(`client:${ws.id}`);
    if (!clientInfo) return;

    const { userId, meetingId } = JSON.parse(clientInfo);

    // Remove user from Redis
    await redis.srem(`meeting:${meetingId}:participants`, userId);
    await redis.del(`client:${ws.id}`);

    // Notify other participants about the user leaving
    const user = await getUserById(userId);
    const username = user ? user.name : "Unknown User";
    await redis.publish(`meeting:${meetingId}`, JSON.stringify({
        type: "user-left",
        username,
    }));

    console.log(`${username} đã rời cuộc họp ${meetingCode}`);
}


// Subscribe to Redis Pub/Sub for meeting messages
export function subscribeToMeetingMessages() {
    const sub = redis.duplicate(); // Tạo Redis Subscriber
    sub.psubscribe("meeting:*");

    sub.on("pmessage", async (pattern, channel, message) => {
        try {
            const meetingId = channel.split(":")[1]; // Lấy meetingId từ channel
            const parsedMessage = JSON.parse(message);
            const wss = getWebSocketInstance();

            if (!wss) return;

            // 🔹 Lấy danh sách userId từ Redis
            const participants = await redis.smembers(`meeting:${meetingId}:participants`);

            // 🔹 Gửi tin nhắn đến tất cả participants
            for (const userId of participants) {
                const clientWsId = await redis.get(`client:${userId}`);
                if (clientWsId) {
                    const clientWs = [...wss.clients].find(
                        (client) => client.id === clientWsId
                    );

                    if (clientWs && clientWs.readyState === WebSocket.OPEN) {
                        clientWs.send(JSON.stringify(parsedMessage));
                    }
                }
            }
        } catch (error) {
            console.error("❌ Lỗi khi xử lý tin nhắn Pub/Sub:", error);
        }
    });

    console.log("✅ Subscribed to Redis meeting messages");
}

