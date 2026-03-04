// const clientInfo = clients.get(ws);
// if (!clientInfo) return;
// const { username, meetingCode } = clientInfo;

// await Message.create({
//     senderId: (await User.findOne({ where: { name: username } })).id,
//     meetingId: (await Meeting.findOne({ where: { code: meetingCode } })).id,
//     text: data.message,
// });

// broadcastToMeeting(meetingCode, {
//     type: "chat-message",
//     from: username,
//     message: data.message,
//     timestamp: Date.now(),
// });
// break;


// import redis from "../config/redis.js";
// import { broadcastToMeeting } from "./meetingHandler.js";
// import { User, Meeting, Message } from "../database/index.js";

// export async function handleChatMessage(ws, data) {
//     const clientInfo = await redis.get(`client:${ws.id}`);
//     if (!clientInfo) return;

//     const { username, meetingCode } = JSON.parse(clientInfo);

//     let userId = await redis.get(`user:${username}:id`);
//     if (!userId) {
//         const user = await User.findOne({ where: { name: username } });
//         if (!user) return;
//         userId = user.id;
//         await redis.set(`user:${username}:id`, userId, "EX", 3600); // Cache 1 giờ
//     }

//     let meetingId = await redis.get(`meeting:${meetingCode}:id`);
//     if (!meetingId) {
//         const meeting = await Meeting.findOne({ where: { code: meetingCode } });
//         if (!meeting) return;
//         meetingId = meeting.id;
//         await redis.set(`meeting:${meetingCode}:id`, meetingId, "EX", 3600); // Cache 1 giờ
//     }

//     // 🔹 Lưu tin nhắn vào database
//     const message = {
//         senderId: userId,
//         meetingId,
//         text: data.message,
//         timestamp: Date.now(),
//     };
//     await Message.create(message);

//     // 🔹 Publish message lên Redis để gửi tới tất cả WebSocket servers
//     await redis.publish("meeting-messages", JSON.stringify({ meetingCode, data: message }));

//     // 🔹 Gửi tin nhắn đến tất cả người dùng trong phòng
//     await broadcastToMeeting(meetingCode, {
//         type: "chat-message",
//         from: username,
//         message: data.message,
//         timestamp: message.timestamp,
//     });

//     console.log(`📩 ${username} gửi tin nhắn trong phòng ${meetingCode}: ${data.message}`);
// }
