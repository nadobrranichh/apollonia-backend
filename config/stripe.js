import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const stripeObject = new Stripe(process.env.STRIPE_SECRET_KEY);
