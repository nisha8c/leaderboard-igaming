import express from "express";
import { verifyJwt } from "../middleware/verifyJwt";
import Player from "../models/Player";

const router = express.Router();

// Get test route
router.get("/", (req, res) => {
  res.send("Admin API is up!");
});

// Add player
router.post("/add-player", verifyJwt, async (req, res) => {
  if (!req.user["cognito:groups"]?.includes("admin")) {
    return res.status(403).json({ message: "Admins only" });
  }

  const { name, score } = req.body;

  if (!name || !score) {
    return res.status(400).json({ message: "Name and score are required" });
  }

  const player = new Player({ name, score });
  await player.save();

  res.json({ message: "Player added!", player });
});

// Update score
router.put("/update-score/:id", verifyJwt, async (req, res) => {
  if (!req.user["cognito:groups"]?.includes("admin")) {
    return res.status(403).json({ message: "Admins only" });
  }

  const { score } = req.body;
  const updated = await Player.findByIdAndUpdate(
    req.params.id,
    { score, lastUpdated: new Date() },
    { new: true }
  );

  res.json({ message: "Score updated!", updated });
});

// Delete player
router.delete("/delete-player/:id", verifyJwt, async (req, res) => {
  if (!req.user["cognito:groups"]?.includes("admin")) {
    return res.status(403).json({ message: "Admins only" });
  }

  await Player.findByIdAndDelete(req.params.id);

  res.json({ message: "Player deleted!" });
});

export default router;
