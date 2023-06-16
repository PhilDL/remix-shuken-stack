import Stripe from "stripe";

import { env } from "~/env.ts";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
  typescript: true,
});
