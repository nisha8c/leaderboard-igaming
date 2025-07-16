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

  // ✅ Handle Lambda: Buffer or string!
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (err) {
      console.error("❌ Failed to parse Buffer req.body:", err);
      return res.status(400).json({ message: "Invalid Buffer JSON body" });
    }
  } else if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (err) {
      console.error("❌ Failed to parse req.body string:", err);
      return res.status(400).json({ message: "Invalid JSON body" });
    }
  }

  console.log("Parsed body:", req.body);

  const { name, score } = req.body;

  console.log("name:", name, ' score: ', score);

  if (!name || typeof score !== 'number' || isNaN(score)) {
    return res.status(400).json({ message: "Name is required and score must be a valid number" });
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

  // ✅ Add this fix!
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (err) {
      console.error("❌ Failed to parse Buffer req.body:", err);
      return res.status(400).json({ message: "Invalid Buffer JSON body" });
    }
  } else if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (err) {
      console.error("❌ Failed to parse req.body string:", err);
      return res.status(400).json({ message: "Invalid JSON body" });
    }
  }

  const { name, score } = req.body;
  console.log('Updating with ::::', name, ' and ', score);

  const updated = await Player.findByIdAndUpdate(
    req.params.id,
    {
      ...(name && { name }),
      ...(score !== undefined && { score }),
      lastUpdated: new Date(),
    },
    { new: true }
  );

  console.log('UPDATED player: ', updated);

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
