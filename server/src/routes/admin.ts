import express from "express";
import { verifyJwt } from "../middleware/verifyJwt";
import Player from "../models/Player";
import { checkAdminAndParseBody } from '../middleware/checkAdminAndParseBody';
import AWS from "aws-sdk";

const router = express.Router();
// AWS Cognito Setup
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: "eu-north-1",
});

function validateNameAndScore(name: any, score: any) {
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
    return "Name must be a non-empty string (max 50 chars).";
  }
  if (typeof score !== 'number' || isNaN(score) || score < 0) {
    return "Score must be a non-negative number.";
  }
  return null;
}

router.get("/", (_req, res) => {
  res.send("Admin API is up!");
});

/*
router.post("/add-player", verifyJwt, checkAdminAndParseBody, async (req, res) => {
  const { name, score } = req.body;

  const validationError = validateNameAndScore(name, score);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const player = await new Player({ name, score }).save();
  return res.status(201).json({ message: "Player added!", player });

});*/

router.post("/add-player", verifyJwt, checkAdminAndParseBody, async (req, res) => {
  const { name, score, email } = req.body;

  const validationError = validateNameAndScore(name, score);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "A valid email is required." });
  }

  // ✅ Create Cognito user with given email
  try {
    await cognito
      .adminCreateUser({
        UserPoolId: process.env.USER_POOL_ID!,
        Username: email,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
        ],
        TemporaryPassword: "TempPass123!",
        //MessageAction: "SUPPRESS",
      })
      .promise();
  } catch (err) {
    console.error("❌ Cognito creation error:", err);
    return res.status(500).json({ message: "Failed to create Cognito user." });
  }

  const player = await new Player({ name, score }).save();
  return res.status(201).json({ message: "Player added!", player });
});

router.put("/update-score/:id", verifyJwt, checkAdminAndParseBody, async (req, res) => {
  const { name, score } = req.body;

  // Partial update: Validate only if fields are provided
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
      return res.status(400).json({ message: "Name must be a non-empty string (max 50 chars)." });
    }
  }

  if (score !== undefined) {
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      return res.status(400).json({ message: "Score must be a non-negative number." });
    }
  }

  const updated = await Player.findByIdAndUpdate(
    req.params.id,
    {
      ...(name && { name }),
      ...(score !== undefined && { score }),
      lastUpdated: new Date(),
    },
    { new: true }
  );

  return res.status(200).json({ message: "Player updated!", updated });
});

router.delete("/delete-player/:id", verifyJwt, async (req, res) => {
  if (!req.user["cognito:groups"]?.includes("admin")) {
    return res.status(403).json({ message: "Admins only" });
  }

  const deleted = await Player.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Player not found." });
  }

  return res.status(200).json({ message: "Player deleted!", player: deleted });
});

export default router;
