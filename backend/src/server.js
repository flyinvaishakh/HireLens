import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import {clerkMiddleware} from "@clerk/express";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();
const __dirname = path.resolve();

// ------------------ MIDDLEWARE ------------------
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());//this adds auth field to request object: req.auth()

// ------------------ INNGEST ENDPOINT ------------------
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat",chatRoutes);

// ------------------ CLERK WEBHOOK → INNGEST BRIDGE ------------------
app.post("/api/clerk-webhook", async (req, res) => {
  try {
    const evt = req.body;

    console.log("📩 Clerk webhook received:", evt.type);

    if (evt.type === "user.created") {
      await inngest.send({
        name: "clerk/user.created",
        data: evt.data,
      });
      console.log("➡️ Sent event to Inngest: clerk/user.created");
    }

    if (evt.type === "user.deleted") {
      await inngest.send({
        name: "clerk/user.deleted",
        data: evt.data,
      });
      console.log("➡️ Sent event to Inngest: clerk/user.deleted");
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Clerk webhook error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
});

// ------------------ HEALTH CHECK ------------------
app.get("/health", (req, res) => {
  req.auth;
  res.status(200).json({ msg: "api is up and running" });
});



// ------------------ FRONTEND SERVE (PROD) ------------------
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// ------------------ START SERVER ------------------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log(`🚀 Server running on port ${ENV.PORT}`)
    );
  } catch (error) {
    console.error("💥 Error starting server:", error);
  }
};

startServer();
