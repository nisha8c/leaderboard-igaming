import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
    res.send("Server is running! 🎉");
});

// ✅ Public routes (like GET leaderboard)
app.get("/api/leaderboard", (req, res) => {
    // TODO: Return top 10 players
    res.json([]);// ✅ Root route
    app.get("/", (req, res) => {
        res.send("Server is running! 🎉");
    });
});

// ✅ Protected admin routes
app.use("/api/admin", adminRoutes);

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
