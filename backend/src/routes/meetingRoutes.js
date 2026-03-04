import express from "express";
import { createMeeting, getMeetings, getMeetingByCodeMeeting, getMeetingByUser, updateMeeting, deleteMeeting } from "../controllers/meetingController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { meetingValidation } from "../../middlewares/validationMiddleware.js";


const router = express.Router();

router.post("/", authenticate, meetingValidation.create, createMeeting);
router.get("/", authenticate, getMeetings);
router.get("/user/:userId", authenticate, getMeetingByUser)
router.get("/:meetingCode", authenticate, getMeetingByCodeMeeting)
router.put("/:id", authenticate, updateMeeting);
router.delete("/:id", authenticate, deleteMeeting);

export default router;
