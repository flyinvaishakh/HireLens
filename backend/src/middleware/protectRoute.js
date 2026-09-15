import { requireAuth } from "@clerk/express";
import { getOrCreateUser } from "../services/userService.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      req.user = await getOrCreateUser(clerkId);

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
];