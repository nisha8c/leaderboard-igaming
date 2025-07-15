// server/src/routes/admin.ts

import express from "express";
import { verifyJwt } from "../middleware/verifyJwt";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Admin API is up!");
});

// Example: Add a new player
router.post("/add-player", verifyJwt, (req, res) => {
  if (!req.user["cognito:groups"]?.includes("admin")) {
    return res.status(403).json({ message: "Admins only" });
  }

  // TODO: Add your logic here to add a player
  res.json({ message: "Player added!" });
});

// Example: Update a player's score
router.put("/update-score/:id", verifyJwt, (req, res) => {
  if (!req.user["cognito:groups"]?.includes("admin")) {
    return res.status(403).json({ message: "Admins only" });
  }

  // TODO: Add your update logic
  res.json({ message: "Score updated!" });
});

// Example: Delete a player
router.delete("/delete-player/:id", verifyJwt, (req, res) => {
  if (!req.user["cognito:groups"]?.includes("admin")) {
    return res.status(403).json({ message: "Admins only" });
  }

  // TODO: Delete logic
  res.json({ message: "Player deleted!" });
});

export default router;
