import express from "express";
import axios from "axios";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000";

router.post("/", protectRoute, async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!language || typeof code !== "string") {
      return res.status(400).json({ error: "Language and code are required" });
    }

    const response = await axios.post(
      `${PISTON_URL}/api/v2/execute`,
      {
        language,
        version: "*",
        files: [
          {
            content: code,
          },
        ],
      },
      { timeout: 15000 }
    );

    const { run, compile } = response.data;

    res.json({
      run: {
        output: run?.stdout || "",
        stderr: compile?.stderr || run?.stderr || "",
        code: run?.code,
        signal: run?.signal,
        compile_output: compile?.output || "",
      },
    });
  } catch (err) {
    console.error("Piston execution error:", err.response?.data || err.message);

    if (err.code === "ECONNABORTED") {
      return res.status(504).json({
        error: "Code execution timed out",
        details: "The execution exceeded the time limit.",
      });
    }

    res.status(500).json({
      error: "Execution failed",
      details: err.response?.data || err.message,
    });
  }
});

export default router;