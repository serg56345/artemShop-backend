import express from "express";
import pool from "../db.js";
import { sendTelegramMessage, sendTelegramPhoto } from "../telegram.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, items, total, phone, address, paymentType } = req.body;

  if (!userId || !items?.length || !total || !phone || !address || !paymentType) {
    return res.status(400).json({ message: "Будь ласка, заповніть усі поля" });
  }

  try {
    // 1️⃣ Зберігаємо замовлення
    const result = await pool.query(
      `INSERT INTO orders (user_id, items, total, phone, address, payment_type)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [userId, JSON.stringify(items), total, phone, address, paymentType]
    );

    const order = result.rows[0];

    // 2️⃣ items з БД -> масив
    const orderItems = typeof order.items === "string"
      ? JSON.parse(order.items)
      : order.items;

    // 3️⃣ Відповідь клієнту
    res.json({ message: "Замовлення успішно оформлено!", order });

    // 4️⃣ Імʼя користувача
    const userRes = await pool.query(
      "SELECT name FROM users WHERE id=$1",
      [userId]
    );
    const userName = userRes.rows[0]?.name || `Користувач ${userId}`;

    // 5️⃣ Текст замовлення
    const itemsText = orderItems
      .map(i => `• ${i.name} x${i.qty} — ${i.price} грн`)
      .join("\n");

    const message = `
🛒 НОВЕ ЗАМОВЛЕННЯ
👤 Користувач: ${userName}
📞 Телефон: ${order.phone}
📍 Адреса: ${order.address}
💳 Оплата: ${order.payment_type}
💰 Сума: ${order.total} грн

📦 Товари:
${itemsText}
    `;

    // 6️⃣ Надсилаємо текст
    await sendTelegramMessage(message);

    // 7️⃣ Надсилаємо ФОТО товарів
    for (const item of orderItems) {
      if (item.img) {
        // якщо шлях відносний — додаємо домен
        const photoUrl = item.img.startsWith("http")
          ? item.img
          : `https://your-site.com/${item.img}`;

        await sendTelegramPhoto(
          photoUrl,
          `${item.name}\nК-сть: ${item.qty}\nЦіна: ${item.price} грн`
        );
      }
    }

  } catch (err) {
    console.error("❌ Order error:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

export default router;
