import express from "express";
import { createUser, getUsers, getUserById } from "../controllers/userController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUserById);

export default router;
