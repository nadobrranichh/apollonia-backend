import { client } from "../config/db.js";

export async function saveShippingData(sessionId, formData) {
  const query = `
    INSERT INTO shipping_addresses (
      email, first_name, last_name, address1, address2,
      country, state, postal_code, city, phone_number, session_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`;

  const {
    email,
    shipping: {
      firstName,
      lastName,
      address1,
      address2,
      country,
      postalCode,
      city,
      state,
      phoneNumber,
    },
  } = formData;

  const values = [
    email,
    firstName,
    lastName,
    address1,
    address2,
    country,
    state,
    postalCode,
    city,
    phoneNumber,
    sessionId,
  ];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting shipping info:", error);
    throw error;
  }
}
