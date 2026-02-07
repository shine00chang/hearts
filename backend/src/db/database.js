import "dotenv/config"
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE,
});

export const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
}

export const getClient = () => { 
  return pool.connect()
}
