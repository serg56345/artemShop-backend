import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Реєстрація
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "Будь ласка, заповніть усі поля" });

    try {
        const userExists = await pool.query("SELECT 1 FROM users WHERE email=$1", [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: "Користувач уже існує" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        console.log(`🆕 Користувач зареєстрований: ${email}`);
        res.status(201).json({ message: "Реєстрація успішна!", user: result.rows[0] });
    } catch (err) {
        console.error("❌ Register error:", err.message || err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// Логін
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Будь ласка, заповніть усі поля" });

    try {
        const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if (userRes.rows.length === 0) return res.status(400).json({ message: "Користувача не знайдено" });

        const user = userRes.rows[0];
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return res.status(400).json({ message: "Невірний пароль" });

        console.log(`🔑 Користувач увійшов: ${email}`);
        res.json({ message: "Успішний вхід", user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error("❌ Login error:", err.message || err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

export default router;
