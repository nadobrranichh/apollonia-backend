import { pool } from "../config/db.js";

export const getProducts = async function () {
  try {
    const result = await pool.query("SELECT * FROM products");
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};
