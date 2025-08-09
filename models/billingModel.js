import { client } from "../config/db.js";

export const saveBillingData = async function (sessionId, formData) {
  const billingDataQuery = `INSERT INTO billing_addresses (
  email,
  first_name,
  last_name,
  address1,
  address2,
  country,
  state,
  postal_code,
  city,
  phone_number,
  session_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
  const {
    email,
    billing: {
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

  const billingValues = [
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
    await client.query(billingDataQuery, billingValues);
  } catch (error) {
    console.error("error inserting billing info:", error);
    throw error;
  }
};
