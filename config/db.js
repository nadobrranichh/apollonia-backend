import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: process.env.POSTGRESQL_PORT,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
  ssl: { rejectUnauthorized: false },

  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("PostgreSQL error:", err);
});
