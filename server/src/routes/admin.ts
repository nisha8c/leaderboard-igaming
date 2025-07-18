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

function isAdminUser(user: any): boolean {
  return (
    user &&
    typeof user === "object" &&
    Array.isArray(user["cognito:groups"]) &&
    user["cognito:groups"].includes("admin")
  );
}

function validateNameAndScore(name: string, score: number): string | null {
  if (name.trim().length === 0 || name.length > 50) {
    return "Name must be a non-empty string (max 50 chars).";
  }
  if (isNaN(score) || score < 0) {
    return "Score must be a non-negative number.";
  }
  return null;
}

router.get("/", (_req, res) => {
  res.send("Admin API is up!");
});

router.post("/add-player", verifyJwt, checkAdminAndParseBody, async (req, res) => {
  const { name, score, email, isAdmin } = req.body;

  const validationError = validateNameAndScore(name, score);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "A valid email is required." });
  }

  // 💾 Check if player with this email already exists in MongoDB
  const existingPlayer = await Player.findOne({ email });
  if (existingPlayer) {
    return res.status(409).json({ message: "Player with this email already exists." });
  }

  // 🔐 Check if user already exists in Cognito
  try {
    await cognito.adminGetUser({
      UserPoolId: process.env.USER_POOL_ID!,
      Username: email,
    }).promise();

    return res.status(409).json({ message: "Cognito user with this email already exists." });
  } catch (err: any) {
    if (err.code !== "UserNotFoundException") {
      console.error("❌ Cognito lookup error:", err);
      return res.status(500).json({ message: "Failed to validate email with Cognito." });
    }
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
      }).promise();

    if (isAdmin) {
      await cognito.adminAddUserToGroup({
        UserPoolId: process.env.USER_POOL_ID!,
        Username: email,
        GroupName: "admin",
      }).promise();
    }

  } catch (err) {
    console.error("❌ Cognito creation error:", err);
    return res.status(500).json({ message: "Failed to create Cognito user." });
  }

  const player = await new Player({ name, score, email }).save();
  return res.status(201).json({ message: "Player added!", player });
});

router.put("/update-score/:id", verifyJwt, checkAdminAndParseBody, async (req, res) => {
  try {
    const { name, score } = req.body;

    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found." });

    // Validate if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 50)) {
      return res.status(400).json({ message: "Name must be a non-empty string (max 50 chars)." });
    }
    if (score !== undefined && (typeof score !== 'number' || isNaN(score) || score < 0)) {
      return res.status(400).json({ message: "Score must be a non-negative number." });
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
  } catch (err) {
    console.error("❌ Update error:", err);
    return res.status(500).json({ message: "Failed to update player." });
  }
});

router.delete("/delete-player/:id", verifyJwt, async (req, res) => {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({ message: "Admins only" });
  }

  // Fetch player to get email before deleting
  const player = await Player.findById(req.params.id);
  if (!player) {
    return res.status(404).json({ message: "Player not found." });
  }

  try {
    // 👇 Delete user from Cognito (username = email)
    if (player.email) {
      await cognito.adminDeleteUser({
        UserPoolId: process.env.USER_POOL_ID!,
        Username: player.email,
      }).promise();
    }
  } catch (err) {
    console.error("❌ Failed to delete Cognito user:", err);
  }

  // 👇 Delete from MongoDB
  await Player.findByIdAndDelete(req.params.id);

  return res.status(200).json({ message: "Player deleted!", player });
});


export default router;
