// backend/src/lib/env.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Safely replicate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go 2 levels up from backend/src/lib/ to reach the backend/ root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  PISTON_URL: process.env.PISTON_URL || "http://localhost:2000",
};