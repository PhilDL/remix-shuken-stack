import type { Customer, Price } from "@prisma/client";
import type { Stripe } from "stripe";

import { env } from "~/env.ts";
import { stripe } from "~/providers/stripe/config.server.ts";

export async function createStripeCheckoutSession(
  stripeCustomerId: Customer["stripeCustomerId"],
  priceId: Price["id"],
  params?: Stripe.Checkout.SessionCreateParams
) {
  if (!stripeCustomerId || !priceId)
    throw new Error(
      "Missing required parameters to create Stripe Checkout Session."
    );

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    payment_method_types: ["card"],
    success_url: `${env.APP_URL}/checkout`,
    cancel_url: `${env.APP_URL}/plans`,
    ...params,
  });
  if (!session?.url)
    throw new Error("Unable to create Stripe Checkout Session.");

  return session.url;
}
