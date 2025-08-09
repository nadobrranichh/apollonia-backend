import { client } from "../config/db.js";

export const getProducts = async function () {
  try {
    const result = await client.query("SELECT * FROM products");
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};
