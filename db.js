// Backend/db.js
import dotenv from "dotenv";
dotenv.config();  // <- важливо! має бути першою

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default pool;
