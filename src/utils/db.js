// db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}
