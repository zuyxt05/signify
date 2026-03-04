import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

import User from "./User.js";
import Meeting from "./Meeting.js";

const Message = sequelize.define("Message", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    senderId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" },onDelete: "CASCADE",onUpdate: "CASCADE" },
    meetingId: { type: DataTypes.UUID, allowNull: false, references: { model: Meeting, key: "id" }, onDelete: "CASCADE",onUpdate: "CASCADE"},
    text: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },    
});

export default Message;
