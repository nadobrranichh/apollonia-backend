import { calculateHST, calculateSubtotal } from "../utils/cartMethods.js";
import { client } from "../config/db.js";
import { saveShippingData } from "../models/shippingModel.js";
import { saveBillingData } from "../models/billingModel.js";
import { saveCartData } from "../models/cartModel.js";

export const saveCheckoutSession = async function (
  stripeSession,
  formData,
  cart
) {
  const sessionQuery = `
    INSERT INTO sessions (
      stripe_session_id,
      status,
      subtotal_in_cents,
      hst_in_cents,
      is_billing_same_as_shipping,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
  `;

  const sessionValues = [
    stripeSession.id,
    "pending",
    calculateSubtotal(cart),
    calculateHST(cart),
    formData.billingSameAsShipping,
    new Date().toISOString(),
  ];
  let sessionData;
  try {
    const result = await client.query(sessionQuery, sessionValues);
    sessionData = result.rows[0];

    await saveShippingData(sessionData.id, formData);
    if (formData.billingSameAsShipping === false)
      saveBillingData(sessionData.id, formData);

    await saveCartData(sessionData.id, cart);
  } catch (error) {
    console.error("Failed to insert session:", error);
    throw error;
  }
};
