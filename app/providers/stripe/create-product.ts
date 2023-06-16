import type { Product } from "@prisma/client";
import type { Stripe } from "stripe";

import { stripe } from "./config.server.ts";

export async function createStripeProduct(
  product: Partial<Product>,
  params?: Stripe.ProductCreateParams
) {
  if (!product || !product.name)
    throw new Error("Missing required parameters to create Stripe Product.");

  return stripe.products.create({
    ...params,
    name: product.name,
    description: product.description || undefined,
  });
}
