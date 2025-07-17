import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin";
import Player from './models/Player';
import { verifyJwt } from './middleware/verifyJwt';

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server is running!");
});

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

app.use("/api/admin", adminRoutes);

export default app;
