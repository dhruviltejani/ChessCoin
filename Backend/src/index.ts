import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow any localhost or 127.0.0.1 origin (e.g., port 5173, 5174, etc.)
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isConfigured = Boolean(process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL);

      if (isLocalhost || isConfigured) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Run database migrations on startup
const initDatabase = async () => {
  try {
    const migrationPath = path.join(__dirname, "migrations", "init.sql");
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, "utf-8");
      await pool.query(sql);
      console.log("Database schema initialized successfully.");
    }
  } catch (err) {
    console.error("Failed to run database migrations:", err);
  }
};

// Routes
app.get("/health", async (_req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      dbTime: dbRes.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: String(err),
    });
  }
});

app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`ChessCoin Backend running on http://localhost:${PORT}`);
  await initDatabase();
});
