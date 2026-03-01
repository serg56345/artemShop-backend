import express from "express";
import pool from "../db.js";

const router = express.Router();

// Отримати коментарі для поста
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC",
            [postId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Помилка отримання коментарів" });
    }
});

// Додати коментар
router.post("/", async (req, res) => {
    const { post_id, user_id, text } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO comments (post_id, user_id, text) VALUES ($1, $2, $3) RETURNING *",
            [post_id, user_id, text]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ FULL ERROR:", err);
        res.status(500).json({
            message: err.message,
            code: err.code,
            detail: err.detail
        });
    }
});

export default router;
