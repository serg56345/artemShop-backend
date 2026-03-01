import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

import pool from "./db.js";

// ------------------ WARM-UP FUNCTION ------------------
async function warmUpDatabase() {
  try {
    await pool.query("SELECT 1"); // Простий запит для "розігріву" бази
    console.log("🔥 База розігріта!");
  } catch (err) {
    console.error("❌ Помилка розігріву бази:", err.message || err);
  }
}

// ------------------ INIT SERVER ------------------
async function startServer() {
  try {
    console.log("⏳ Перевірка підключення до бази...");

    // 1. Перевірка підключення до БД перед запуском сервера
    await pool.query("SELECT 1");
    console.log("✅ Підключення до БД успішне");

    // 2. Створення додатку
    const app = express();

    app.use(cors());
    app.use(express.json());

    // ------------------ WARM-UP INTERVAL ------------------
    // Викликаємо один раз на старті
    warmUpDatabase();
    // Потім повторюємо кожні 5 хвилин, щоб база не засинала
    setInterval(warmUpDatabase, 5 * 60 * 1000);

    // 3. Тестовий маршрут
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

    // 4. Маршрути
    app.use("/api/products", productRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/order", orderRoutes);
    app.use("/api/posts", blogRoutes);
    app.use("/api/comments", commentRoutes);
    

    // 5. Запуск сервера
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Сервер запущено на порту ${PORT}`)
    );

  } catch (err) {
    console.error("❌ Неможливо підключитись до БД:", err.message || err);
    process.exit(1); // Сервер не запускається без БД
  }
}

startServer();



