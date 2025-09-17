import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;
export const client = new Client({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: process.env.POSTGRESQL_PORT,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();
