import { client } from "../config/db.js";

export const flagSessionAsFailed = async function (sessionId) {
  try {
    await client.query(
      `UPDATE sessions SET status = 'failed' WHERE stripe_session_id = $1`,
      [sessionId]
    );
  } catch (error) {
    console.error("ERROR FLAGGING SESSION AS FAILED: ", error);
    throw error;
  }
};
