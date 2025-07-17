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
  const { all, search, minScore, maxScore, sort, order, page = 1, limit = 10 } = req.query;
  let query = Player.find();

// → Search
  if (search) query = query.where('name', new RegExp(search as string, 'i'));

// → Filter score
  if (minScore) query = query.where('score').gte(Number(minScore));
  if (maxScore) query = query.where('score').lte(Number(maxScore));

// → Sort
  const sortField = (sort && ['name', 'score'].includes(sort as string) ? sort : 'score') as string;
  const sortOrder = order === 'asc' ? 1 : -1;
  query = query.sort({ [sortField]: sortOrder });

// → Pagination
  const lim = Math.min(Number(limit), 100);
  const skip = (Number(page) - 1) * lim;
  query = query.skip(skip).limit(lim);

  const isAdmin = req.user?.['cognito:groups']?.includes('admin');
  if (!isAdmin || all !== 'true') {
    query = query.limit(10);
  }

  const players = await query.exec();
  const total = await Player.countDocuments(query.getFilter());
  res.json({ players, total });
});

app.use("/api/admin", adminRoutes);

export default app;
