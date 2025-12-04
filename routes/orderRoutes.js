import express from "express";
import pool from "../db.js";
import { sendTelegramMessage } from "../telegram.js";

const router = express.Router();

// Додати замовлення
router.post("/", async (req, res) => {
    const { userId, items, total, phone, address, paymentType } = req.body;

    if (!userId || !items?.length || !total || !phone || !address || !paymentType) {
        return res.status(400).json({ message: "Будь ласка, заповніть усі поля" });
    }

    try {
        // Створюємо замовлення
        const result = await pool.query(
            "INSERT INTO orders(user_id, items, total, phone, address, payment_type) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
            [userId, JSON.stringify(items), total, phone, address, paymentType]
        );

        const order = result.rows[0];

        console.log(`🛒 Замовлення створено для користувача ${userId}`);
        res.json({ message: "Замовлення успішно оформлено!", order });

        // Отримуємо ім'я користувача
        const userRes = await pool.query("SELECT name FROM users WHERE id=$1", [userId]);
        const userName = userRes.rows[0]?.name || `Користувач ${userId}`;

        // Формуємо текст замовлення
        const itemsText = order.items.map(i => `${i.name} x${i.quantity}`).join("\n");
        const message = `
Нове замовлення!
Користувач: ${userName}
Телефон: ${order.phone}
Адреса: ${order.address}
Сума: ${order.total}
Оплата: ${order.payment_type}
Товари:
${itemsText}
        `;

        // Відправляємо повідомлення в Telegram
        await sendTelegramMessage(message);

    } catch (err) {
        console.error("❌ Order error:", err.message || err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// Отримати замовлення користувача
router.get("/", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "Не вказано користувача" });

    try {
        const result = await pool.query(
            "SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC",
            [userId]
        );
        res.json({ orders: result.rows });
    } catch (err) {
        console.error("❌ Fetch orders error:", err.message || err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

export default router;
