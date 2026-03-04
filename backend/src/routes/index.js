import express from "express";
import meetingRoutes from "./meetingRoutes.js";
import messageRoutes from "./messageRoutes.js";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

router.use("/meetings", meetingRoutes);
router.use("/messages", messageRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);

export default router;
