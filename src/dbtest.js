import "dotenv/config";
import { query, pool } from "./database.js";

async function main() {
  try {
    await pool.query(`
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
`);
    await pool.query(`
INSERT INTO users (username, password_hash)
VALUES
  ('a', 'a_pwd'),
  ('c', 'c_pwd')
`);
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await pool.end();
  }
}

main();

