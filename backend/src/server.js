import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url"; //since am using ES modules (import), __dirname doesn't exist automatically.
import { serve } from "inngest/express"; //Creates an Express endpoint that lets Inngest receive and execute background jobs.
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import { clerkMiddleware } from "@clerk/express";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import executeRoute from "./routes/executeRoute.js";
import problemRoutes from "./routes/problemRoutes.js";
import User from "./models/User.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));

if (ENV.NODE_ENV !== "production") {
  app.get("/debug/users", async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error("Error fetching debug users:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
}

app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/execute", executeRoute);
app.use("/api/problems", problemRoutes);

//Clerk firing the webhook
// TODO: Verify Clerk webhook signature using svix package
// See: https://clerk.com/docs/webhooks/sync-data#validate-the-webhook-payload
app.post("/api/clerk-webhook", async (req, res) => {
  console.log("========== WEBHOOK HIT ==========");
  try {
    const evt = req.body; //get the webhook payload

    console.log("📩 Clerk webhook received:", evt.type);

    //if a new user signs up, send an inngest event. We are not creating the user directly here.
    if (evt.type === "user.created") {
      await inngest.send({
        name: "clerk/user.created",
        data: evt.data,
      });
      
      console.log("➡️ Sent event to Inngest: clerk/user.created");
    }

    //if a user deletes their account, send an inngest event
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

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("💥 Error starting server:", error);
  }
};

startServer();
