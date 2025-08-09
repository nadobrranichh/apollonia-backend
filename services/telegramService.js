import { formatOrderString } from "../utils/stringMethods.js";

export const sendTelegramMessage = async (formData, cart) => {
  const message = formatOrderString(formData, cart);

  try {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "MarkdownV2",
        }),
      }
    );
  } catch (error) {
    console.error("Failed to send a telegram message:", error);
  }
};
