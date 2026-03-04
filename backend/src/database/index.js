import { sequelize } from "../config/postgres.js";
import User from "../models/User.js";
import Meeting from "../models/Meeting.js";
import MeetingUser from "../models/MeetingUser.js";
import Message from "../models/Message.js";
import dotenv from "dotenv";
dotenv.config();

User.belongsToMany(Meeting, { through: MeetingUser, foreignKey: "userId", onDelete: 'CASCADE', });
Meeting.belongsToMany(User, { through: MeetingUser, foreignKey: "meetingId", onDelete: 'CASCADE', });

Meeting.hasMany(Message, { foreignKey: "meetingId" });
Message.belongsTo(Meeting, { foreignKey: "meetingId" });

Message.belongsTo(User, { foreignKey: "senderId" });
User.hasMany(Message, { foreignKey: "senderId" });


const initDB = async () => {
    try {
        await sequelize.sync({ alter: process.env.DB_ALTER === "true" });
        console.log("✅ Database synchronized.");
    } catch (error) {
        console.error("❌ Database synchronization failed:", error);
        throw error;
    }
};

const syncDB = async () => {
    try {
        const shouldAlter = process.env.DB_ALTER === "true" && process.env.NODE_ENV !== "production";
        await sequelize.sync({ alter: shouldAlter });
        console.log(`✅ Models synchronized${shouldAlter ? " with alter" : ""}.`);
    } catch (error) {
        console.error("❌ Sync failed:", error);
        throw error;
    }
};

export { sequelize, User, Meeting, MeetingUser, Message, syncDB, initDB };
