import express from "express";
import { getStreamToken } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

//if authenticated, getStreamToken
router.get("/token", protectRoute, getStreamToken);

export default router;