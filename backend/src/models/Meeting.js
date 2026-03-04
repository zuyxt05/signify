import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const Meeting = sequelize.define("Meeting", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    meetingCode: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "scheduled" }, // scheduled, ongoing, ended
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.TIME, allowNull: false },
    duration: { type: DataTypes.DATE, allowNull: true },
    isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },
    title:{type: DataTypes.TEXT, allowNull: true}
  });
  
export default Meeting;
