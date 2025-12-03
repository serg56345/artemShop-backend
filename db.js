import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,                 // максимум підключень у пулі
    idleTimeoutMillis: 30000,// закриття неактивних підключень через 30 сек
    connectionTimeoutMillis: 2000 // таймаут підключення
});

pool.on('connect', () => {
    console.log('✅ Підключено до бази даних');
});

pool.on('error', (err) => {
    console.error('❌ Помилка пулу бази даних:', err.message || err);
});

export default pool;
