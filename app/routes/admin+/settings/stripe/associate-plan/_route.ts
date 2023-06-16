import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { auth } from "~/storage/auth.server.ts";
import { createProduct } from "~/models/product.server.ts";
import { stripe } from "~/providers/stripe/config.server.ts";

/**
 *
 * Associate local Stripe product to a local Plan object
 */
export async function action({ request }: DataFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const formData = await request.formData();
  const stripeProductId = formData.get("productId") as string;

  const product = await stripe.products.retrieve(stripeProductId);
  if (!product) return json({ success: false }, { status: 400 });

  const prices = await stripe.prices.list({
    active: true,
    product: product.id,
  });

  await createProduct({
    stripeProductId: product.id,
    name: product.name,
    description: product.description,
    active: true,
    prices: {
      create: prices.data.map((price) => ({
        id: price.id,
        active: price.active,
        currency: price.currency,
        amount: price.unit_amount || 0,
        interval: price.recurring?.interval || "month",
        type: price.type,
      })),
    },
  });

  return json({ success: true }, { status: 200 });
}
