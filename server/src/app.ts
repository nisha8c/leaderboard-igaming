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
/*
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
 */

app.get("/api/leaderboard", verifyJwt, async (req, res) => {
  const { all, search = "", sortBy = "score", sortOrder = "desc", page = "1", limit = "10" } = req.query;
  console.log("🔍 Query Params:", { all, search, sortBy, sortOrder, page, limit });
  const isAdmin = req.user?.['cognito:groups']?.includes('admin');
  console.log("👤 Is Admin:", isAdmin);
  let query = Player.find({
    name: { $regex: search.toString(), $options: "i" },
  });

  if (!isAdmin || all !== 'true') {
    query = query.limit(10);
  } else {
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    query = query.skip(skip).limit(parseInt(limit as string));
  }

  const sortField = sortBy === "name" ? "name" : "score";
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  query = query.sort({ [sortField]: sortDirection });

  const [players, total] = await Promise.all([
    query.exec(),
    isAdmin && all === 'true' ? Player.countDocuments({
      name: { $regex: search.toString(), $options: "i" },
    }) : Promise.resolve(0)
  ]);
  console.log("📦 Returning:", { total, count: players.length });
  res.json({ players, total });
});


app.use("/api/admin", adminRoutes);

export default app;
