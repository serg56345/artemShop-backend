// Backend/routes/orderRoutes.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Додати замовлення
router.post("/", async (req, res) => {
    const { userId, items, total, phone, address, paymentType } = req.body;

    if (!userId || !items || items.length === 0 || !total || !phone || !address || !paymentType) {
        return res.status(400).json({ message: "Будь ласка, заповніть усі поля" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO orders(user_id, items, total, phone, address, payment_type) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
            [userId, JSON.stringify(items), total, phone, address, paymentType]
        );
        res.json({ message: "Замовлення успішно оформлено!", order: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// Отримати замовлення користувача
router.get("/", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "Не вказано користувача" });
    }

    try {
        const result = await pool.query("SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC", [userId]);
        res.json({ orders: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

export default router;
