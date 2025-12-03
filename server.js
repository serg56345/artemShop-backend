import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import pool from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Сервер працює ✅"));

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error("❌ DB test error:", err.message || err);
    res.status(500).json({ success: false, error: "DB connection error" });
  }
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Підключення до БД успішне");
  } catch (err) {
    console.error("❌ Помилка підключення до БД:", err.message || err);
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


