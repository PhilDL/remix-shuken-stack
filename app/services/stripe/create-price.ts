import type { Price, Product } from "@prisma/client";
import type { Stripe } from "stripe";

import type { Interval } from "~/services/stripe/plans.ts";
import { stripe } from "./config.server.ts";

export async function createStripePrice(
  id: Product["id"],
  price: Partial<Price>,
  params?: Stripe.PriceCreateParams
) {
  if (!id || !price)
    throw new Error("Missing required parameters to create Stripe Price.");

  return stripe.prices.create({
    ...params,
    product: id,
    currency: price.currency ?? "usd",
    unit_amount: price.amount ?? 0,
    tax_behavior: "inclusive",
    recurring: {
      interval: (price.interval as Interval) ?? "month",
    },
  });
}
