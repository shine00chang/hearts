import * as db from './database.js'

async function main() {
  try {
    await db.query(`
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
`);
    await db.query(`
INSERT INTO users (username, password_hash)
VALUES
  ('a', 'a_pwd'),
  ('c', 'c_pwd')
`);
  } catch (err) {
    console.error("DB error:", err);
  }
}

main();

