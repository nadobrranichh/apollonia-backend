import { client } from "../config/db.js";

export const saveCartData = async function (sessionId, cart) {
  const cartItemQuery = `INSERT INTO cart_items (
  product_id,
  session_id,
  quantity,
  unit_price_in_cents
  ) VALUES ($1, $2, $3, $4) RETURNING *`;
  const priceQuery = `SELECT price_in_cents FROM products WHERE id = $1`;

  try {
    for (const item of cart) {
      const priceResult = await client.query(priceQuery, [item.id]);
      const unitPrice = priceResult.rows[0]?.price_in_cents;
      const itemValues = [item.id, sessionId, item.quantity, unitPrice];
      const result = await client.query(cartItemQuery, itemValues);
    }
  } catch (error) {
    console.error("failed to insert a cart item:", error);
    throw error;
  }
};
