// Backend/server.js
import dotenv from "dotenv";
dotenv.config(); // <-- має бути на початку

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import pool from "./db.js";

const app = express();

// --- Мідлвари ---
app.use(cors()); // дозволяє запити з фронтенду
app.use(express.json()); // обробка JSON у req.body

// --- Тест сервера ---
app.get("/", (req, res) => res.send("Сервер працює ✅"));

// --- Тест підключення до БД ---
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error("❌ DB error:", err.message || err);
    res.status(500).json({ success: false, error: "DB connection error" });
  }
});

// --- Маршрути ---
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);

// --- Логування підключення до БД при старті ---
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Підключення до БД успішне");
  } catch (err) {
    console.error("❌ Помилка підключення до БД:", err.message || err);
  }
})();

// --- Старт сервера ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
console.log("DATABASE_URL =", process.env.DATABASE_URL);

