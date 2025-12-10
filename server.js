import dotenv from "dotenv";
import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";
import { stripeObject } from "./config/stripe.js";
import { flagSessionAsFailed } from "./models/sessionModel.js";
import { getProducts } from "./models/productsModel.js";
import { getAllQuery } from "./models/genericModel.js";
import { calculateHST } from "./utils/cartMethods.js";
import { generateReceiptMarkup } from "./utils/htmlTemplates.js";
import { checkCart } from "./utils/cartMethods.js";
import { saveCheckoutSession } from "./services/checkoutService.js";
import { sendTelegramMessage } from "./services/telegramService.js";
import { pool } from "./config/db.js";
dotenv.config();

const app = express();

app.use(cors());

export let products = [];
(async () => {
  products = await getProducts();
})();

app.post("/create-checkout-session", express.json(), async (req, res) => {
  try {
    const { formData, cart } = req.body;

    const checkedCart = checkCart(cart);

    const lineItemsArray = [
      ...checkedCart.map((cartItem) => {
        const shopItem = products.find(
          (shopItem) => shopItem.id === cartItem.id
        );
        const itemQuantity =
          cartItem.quantity > shopItem.max_quantity || cartItem.quantity < 1
            ? cartItem.quantity > shopItem.max_quantity
              ? shopItem.max_quantity
              : 1
            : cartItem.quantity;
        return {
          price_data: {
            currency: "CAD",
            product_data: {
              name: shopItem.title,
            },
            unit_amount: shopItem.price_in_cents,
          },
          quantity: itemQuantity,
        };
      }),
      {
        price_data: {
          currency: "CAD",
          product_data: {
            name: "HST",
          },
          unit_amount: Math.round(calculateHST(checkedCart)),
        },
        quantity: 1,
      },
    ];

    const stripeSession = await stripeObject.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItemsArray,
      success_url: `${process.env.FRONTEND_URL}/payment-result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-result?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        formData: JSON.stringify(formData),
        cart: JSON.stringify(checkedCart),
      },
    });
    await saveCheckoutSession(stripeSession, formData, checkedCart);

    res.json({ url: stripeSession.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"];
      const event = await stripeObject.webhooks.constructEvent(
        req.body,
        signature,
        process.env.WEBHOOK_SECRET
      );
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const sessionCompletedQuery = `UPDATE sessions SET status='fulfilled' WHERE stripe_session_id=$1 RETURNING *`;
        const result = await pool.query(sessionCompletedQuery, [session.id]);
        const data = result.rows[0];
        const formData = JSON.parse(session.metadata.formData);
        const cart = JSON.parse(session.metadata.cart);
        const html = generateReceiptMarkup(formData, cart, data.id);
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "apollonia.whitening@gmail.com",
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
        const info = await transporter.sendMail({
          from: "Apollonia <apollonia.whitening@gmail.com>",
          to: formData.email,
          subject: "Order Receipt",
          html,
        });

        await sendTelegramMessage(formData, cart);
      } else if (
        event.type === "checkout.session.expired" ||
        event.type === "payment_intent.canceled" ||
        event.type === "payment_intent.payment_failed"
      ) {
        const session = event.data.object;
        await flagSessionAsFailed(session.id);
      }
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }
);

app.post("/session-status", express.json(), async (req, res) => {
  const { sessionId } = req.body;
  try {
    const result = await pool.query(
      "SELECT status FROM sessions WHERE stripe_session_id=$1",
      [sessionId]
    );
    const status = result.rows[0]?.status;
    if (!status) throw new Error(`status is ${status}`);
    res.send(JSON.stringify({ status }));
  } catch (error) {
    console.error("FAILED TO FIND STRIPE SESSION STATUS BY ID:", error);
  }
});

app.get("/get-products", express.json(), getAllQuery("SELECT * FROM products"));

app.get("/get-reviews", express.json(), getAllQuery("SELECT * FROM reviews"));

app.listen(3000);
