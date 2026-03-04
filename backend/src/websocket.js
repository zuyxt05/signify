import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import url from "url";
import dotenv from "dotenv";
import { User, Meeting, MeetingUser, Message } from "./database/index.js";
import redis from "./config/redis.js";

dotenv.config();


export function initWebSocket(server) {
    const meetings = new Map(); // Map<meetingId, Map<username, WebSocket>>
    const clients = new Map(); // Map<WebSocket, {username, meetingId}>


    function handleError(ws, error, message) {
        console.error(`${message}:`, error);
        ws.send(JSON.stringify({
            type: "error",
            message: message
        }));
    }

    function broadcastToMeeting(meetingCode, message, exclude = null) {
        if (!meetings.has(meetingCode)) return;
        meetings.get(meetingCode).forEach((clientWs, clientUsername) => {
            if (clientWs !== exclude && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify(message));
            }
        });
    }


    async function leaveMeeting(ws) {
        const clientInfo = clients.get(ws);
        if (!clientInfo) return;

        const { username, meetingCode } = clientInfo;
        if (!meetings.has(meetingCode)) return;

        const meeting = meetings.get(meetingCode);
        meeting.delete(username);

        const user = await User.findOne({ where: { name: username } });
        if (user) {
            await MeetingUser.update({ leavedAt: new Date() }, {
                where: { userId: user.id, meetingId: (await Meeting.findOne({ where: { meetingCode } })).id }
            });
        }

        if (meeting.size === 0) {
            await Meeting.update({ status: "ended" }, { where: { meetingCode } });
        }

        broadcastToMeeting(meetingCode, { type: "user-left", username });

        if (meeting.size === 0) meetings.delete(meetingCode);

        clients.delete(ws);
        console.log(`${username} đã rời cuộc họp ${meetingCode}`);
    }



    const wssServer = new WebSocketServer({ server });
    wssServer.on("connection", async (ws, req) => {
        // Authenticate WebSocket connection via token in query string
        try {
            const params = new URLSearchParams(url.parse(req.url).query);
            const token = params.get("token");

            if (!token) {
                ws.close(4001, "Authentication required");
                console.log("❌ WebSocket rejected: No token provided");
                return;
            }

            // Check if token is blacklisted
            const isBlacklisted = await redis.get(`blacklisted:${token}`);
            if (isBlacklisted) {
                ws.close(4001, "Token revoked");
                console.log("❌ WebSocket rejected: Token revoked");
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            ws.userId = decoded.id;
            ws.userEmail = decoded.email;
            console.log(`✅ WebSocket authenticated: ${decoded.email}`);
        } catch (error) {
            ws.close(4001, "Invalid token");
            console.log("❌ WebSocket rejected: Invalid token");
            return;
        }

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);

                switch (data.type) {
                    case "join-room": {
                        const { username, meetingCode } = data;

                        // Tạo phòng mới nếu chưa tồn tại
                        if (!meetings.has(meetingCode)) meetings.set(meetingCode, new Map());
                        const meeting = meetings.get(meetingCode);

                        // Kiểm tra xem username đã tồn tại trong phòng chưa
                        if (meeting.has(username)) return;

                        // Thêm người dùng vào phòng
                        meeting.set(username, ws);
                        clients.set(ws, { username, meetingCode });

                        let userRecord = await User.findOne({ where: { name: username } });
                        let meetingRecord = await Meeting.findOne({ where: { meetingCode } });
                        if (meetingRecord?.status !== "ongoing") {
                            await Meeting.update({ status: "ongoing" }, { where: { meetingCode } });
                        }
                        const meetingId = meetingRecord.id;
                        await MeetingUser.findOrCreate({
                            where: { userId: userRecord.id, meetingId: meetingId },
                            defaults: { joinedAt: new Date() }
                        });

                        // Gửi danh sách người trong phòng cho người mới
                        ws.send(JSON.stringify({
                            type: "meeting-info",
                            participants: Array.from(meeting.keys()),
                        }));

                        // Thông báo cho mọi người về người mới
                        broadcastToMeeting(meetingCode, {
                            type: "user-joined",
                            username,
                            participants: Array.from(meeting.keys()),
                        }, ws);

                        console.log(`${username} đã vào cuộc họp ${meetingCode}`);
                        break;
                    }

                    case "offer":
                    case "answer":
                    case "ice-candidate": {
                        const clientInfo = clients.get(ws);
                        if (!clientInfo) return;

                        const { meetingCode } = clientInfo;
                        const meeting = meetings.get(meetingCode);
                        if (!meeting || !data.target) return;

                        const targetWs = meeting.get(data.target);
                        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                            targetWs.send(JSON.stringify({
                                ...data,
                                from: clientInfo.username
                            }));
                        }
                        break;
                    }


                    case "chat-message": {
                        const clientInfo = clients.get(ws);
                        if (!clientInfo) return;
                        const { username, meetingCode } = clientInfo;

                        broadcastToMeeting(meetingCode, {
                            type: "chat-message",
                            from: username,
                            message: data.message,
                            timestamp: Date.now(),
                        });

                        await Message.create({
                            senderId: (await User.findOne({ where: { name: username } })).id,
                            meetingId: (await Meeting.findOne({ where: { meetingCode } })).id,
                            text: data.message,
                        });


                        break;
                    }
                }
            } catch (error) {
                handleError(ws, error, "Lỗi xử lý tin nhắn");
            }
        });

        ws.on("close", () => leaveMeeting(ws));
        ws.on("error", (error) => handleError(ws, error, "Lỗi WebSocket"));
    });

}