import express from "express";
import { getAllProblems, getProblemBySlug } from "../controllers/problemController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// GET /api/problems — list all problems (optional ?difficulty=Easy)
router.get("/", protectRoute, getAllProblems);

// GET /api/problems/:slug — get a single problem by slug
router.get("/:slug", protectRoute, getProblemBySlug);

export default router;
