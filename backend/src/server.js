import crypto from "crypto";
import express from "express";
import cors from "cors";
import path from "path";
import { createDb, run, get, all } from "./db.js";

const app = express();
const db = createDb();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function hashPassword(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email = "", password = "", avatar = "🧠" } = req.body || {};
    if (!username || String(username).trim().length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }
    await run(
      db,
      "INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)",
      [String(username).trim(), String(email).trim(), hashPassword(password), avatar]
    );
    return res.json({ ok: true });
  } catch (error) {
    if (String(error.message || "").includes("UNIQUE")) {
      return res.status(409).json({ message: "Username already taken" });
    }
    return res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { usernameOrEmail, password = "" } = req.body || {};
    if (!usernameOrEmail) return res.status(400).json({ message: "Username or email is required" });
    const user = await get(
      db,
      "SELECT * FROM users WHERE username = ? OR lower(email) = lower(?) LIMIT 1",
      [String(usernameOrEmail).trim(), String(usernameOrEmail).trim()]
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    return res.json({ ok: true, user: { username: user.username, email: user.email, avatar: user.avatar } });
  } catch (_error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/profiles/upsert", async (req, res) => {
  try {
    const profile = req.body || {};
    const username = String(profile.username || "").trim();
    if (!username) return res.status(400).json({ message: "Username is required" });
    await run(
      db,
      `INSERT INTO profiles (username, games_played, wins, total_score, highest_score, xp, coins, level, streak, payload_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(username) DO UPDATE SET
         games_played=excluded.games_played,
         wins=excluded.wins,
         total_score=excluded.total_score,
         highest_score=excluded.highest_score,
         xp=excluded.xp,
         coins=excluded.coins,
         level=excluded.level,
         streak=excluded.streak,
         payload_json=excluded.payload_json,
         updated_at=CURRENT_TIMESTAMP`,
      [
        username,
        Number(profile.gamesPlayed || 0),
        Number(profile.wins || 0),
        Number(profile.totalScore || 0),
        Number(profile.highestScore || 0),
        Number(profile.xp || 0),
        Number(profile.coins || 0),
        Number(profile.level || 1),
        Number(profile.streak || 0),
        JSON.stringify(profile),
      ]
    );
    return res.json({ ok: true });
  } catch (_error) {
    return res.status(500).json({ message: "Could not save profile" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 10)));
    const items = await all(
      db,
      `SELECT p.username, p.total_score AS totalScore, p.games_played AS gamesPlayed, p.xp, p.streak, u.avatar
       FROM profiles p
       LEFT JOIN users u ON u.username = p.username
       ORDER BY p.total_score DESC
       LIMIT ?`,
      [limit]
    );
    return res.json({ items });
  } catch (_error) {
    return res.status(500).json({ message: "Could not load leaderboard" });
  }
});

const frontendPath = path.resolve(process.cwd(), "..", "gameverse-main");
app.use(express.static(frontendPath));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Gameverse backend running at http://localhost:${PORT}`);
});
