import sqlite3 from "better-sqlite3";

const db = new sqlite3("database.db");

export const createOrder = (req, res) => {
  const { userId, items, total, phone, address, paymentType } = req.body;

  if (!userId || !items || !total || !phone || !address || !paymentType) {
    return res.status(400).json({ msg: "Заповніть всі поля замовлення" });
  }

  const createdAt = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO orders (userId, items, total, phone, address, paymentType, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  try {
    stmt.run(userId, JSON.stringify(items), total, phone, address, paymentType, createdAt);
    res.json({ msg: "Замовлення оформлено ✅" });
  } catch (err) {
    res.status(500).json({ msg: "Помилка сервера" });
  }
};
