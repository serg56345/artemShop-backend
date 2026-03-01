import express from "express";
import pool from "../db.js";

const router = express.Router();

// Отримати всі пости
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Blog error:", err.message || err);
    res.status(500).json({ message: "Помилка отримання постів" });
  }
});

export default router;