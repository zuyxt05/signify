import express from "express";
import { sendMessage, getMessagesByMeeting } from "../controllers/messageController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { messageValidation } from "../../middlewares/validationMiddleware.js";


const router = express.Router();

router.post("/", authenticate, messageValidation.send, sendMessage);
router.get("/meeting/:meetingId", authenticate, getMessagesByMeeting);

export default router;
