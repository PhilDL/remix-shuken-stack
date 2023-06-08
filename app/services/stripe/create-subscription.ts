import type { Customer, Price } from "@prisma/client";
import type { Stripe } from "stripe";

import { stripe } from "./config.server.ts";

export async function createStripeSubscription(
  stripeCustomerId: Customer["stripeCustomerId"],
  price: Price["id"],
  params?: Stripe.SubscriptionCreateParams
) {
  if (!stripeCustomerId || !price)
    throw new Error(
      "Missing required parameters to create Stripe Subscription."
    );

  return stripe.subscriptions.create({
    ...params,
    customer: stripeCustomerId,
    items: [{ price }],
  });
}
