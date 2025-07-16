import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin";
import Player from './models/Player';
import * as mongoose from 'mongoose';
import dotenv from "dotenv";
import serverless from "serverless-http";
import { verifyJwt } from './middleware/verifyJwt';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running!");
});

// routes
/*
app.get("/api/leaderboard", async (req, res) => {
    const topPlayers = await Player.find().sort({ score: -1 }).limit(10);
    res.json(topPlayers);
}); */
app.get("/api/leaderboard", verifyJwt, async (req, res) => {
    const { all } = req.query;

    let query = Player.find().sort({ score: -1 });

    const isAdmin = req.user?.['cognito:groups']?.includes('admin');
    if (!isAdmin || all !== 'true') {
        query = query.limit(10);
    }

    const players = await query.exec();
    res.json(players);
});


// Protected admin routes
app.use("/api/admin", adminRoutes);

export const handler = serverless(app);

