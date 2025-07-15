import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin";
import Player from './models/Player';
import * as mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
    res.send("Server is running! 🎉");
});

// ✅ Public routes (like GET leaderboard)
app.get("/api/leaderboard", async (req, res) => {
    const topPlayers = await Player.find().sort({ score: -1 }).limit(10);
    res.json(topPlayers);
});

// ✅ Protected admin routes
app.use("/api/admin", adminRoutes);

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
