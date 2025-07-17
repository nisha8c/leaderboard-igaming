
import mongoose from "mongoose";
import dotenv from "dotenv";
import serverless from "serverless-http";
import app from "./app";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

export const handler = serverless(app);
