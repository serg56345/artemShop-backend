import sqlite3 from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new sqlite3("database.db");

export const registerUser = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Заповніть всі поля" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    stmt.run(name, email, hashedPassword);
    res.json({ msg: "Реєстрація успішна ✅" });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ msg: "Користувач з таким email вже існує" });
    }
    res.status(500).json({ msg: "Помилка сервера" });
  }
}
