import { makeDomainFunction } from "domain-functions";
import invariant from "tiny-invariant";
import * as z from "zod";

import { prisma } from "~/storage/db.server.ts";
import { stripe } from "~/providers/stripe/config.server.ts";

export const deleteProductAction = makeDomainFunction(
  z.object({
    productId: z.string(),
    action: z.literal("delete"),
  }),
  z.object({
    id: z.string(),
  })
)(async ({ productId, action }, user) => {
  if (action !== "delete") {
    throw new Error("You must confirm the action");
  }
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      prices: {
        where: {
          active: true,
        },
      },
    },
  });
  invariant(product, "Product not found");
  for (const price of product.prices) {
    try {
      await stripe.prices.update(price.id, {
        active: false,
      });
    } catch (error) {
      console.warn(error);
    }
  }
  if (product.stripeProductId) {
    try {
      await stripe.products.del(product.stripeProductId);
    } catch (error) {
      console.warn(error);
    }
  }
  const deletePlan = await prisma.product.delete({
    where: {
      id: productId,
    },
  });
  return deletePlan;
});
