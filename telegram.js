import dotenv from "dotenv";
import fetch from "node-fetch"; // або axios, якщо використовуєш

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Відправка текстового повідомлення
export async function sendTelegramMessage(text) {
    if (!TOKEN || !CHAT_ID) {
        console.error("❌ Telegram TOKEN або CHAT_ID не задано в .env");
        return;
    }

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text })
        });

        const data = await res.json();
        if (!data.ok) {
            console.error("❌ Помилка Telegram API:", data);
        } else {
            console.log("✅ Telegram повідомлення відправлено");
        }
    } catch (err) {
        console.error("❌ Помилка при відправці Telegram повідомлення:", err);
    }
}

// Відправка фото
export async function sendTelegramPhoto(photoUrl, caption = "") {
    if (!TOKEN || !CHAT_ID) {
        console.error("❌ Telegram TOKEN або CHAT_ID не задано в .env");
        return;
    }

    const url = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                photo: photoUrl,
                caption
            })
        });

        const data = await res.json();
        if (!data.ok) {
            console.error("❌ Помилка Telegram API:", data);
        } else {
            console.log("✅ Telegram фото відправлено");
        }
    } catch (err) {
        console.error("❌ Помилка при відправці Telegram фото:", err);
    }
}
