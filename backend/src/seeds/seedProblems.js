import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "../lib/env.js";
import Problem from "../models/Problem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProblems = async () => {
  try {
    if (!ENV.DB_URL) {
      throw new Error("DB_URL is not defined in environment variables");
    }

    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    // Read seed data
    const seedPath = path.join(__dirname, "problemSeed.json");
    const rawData = fs.readFileSync(seedPath, "utf-8");
    const problems = JSON.parse(rawData);

    // Clear existing problems
    const deleteResult = await Problem.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing problems`);

    // Insert new problems
    const inserted = await Problem.insertMany(problems);
    console.log(`✅ Seeded ${inserted.length} problems:`);

    inserted.forEach((p) => {
      console.log(`   • ${p.title} (${p.slug}) — ${p.difficulty}`);
    });

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedProblems();
