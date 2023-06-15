import type { Price, Product } from "@prisma/client";
import { makeDomainFunction } from "domain-functions";
import type Stripe from "stripe";
import invariant from "tiny-invariant";
import * as z from "zod";

import { prisma } from "~/storage/db.server.ts";
import { stripe } from "~/services/stripe/config.server.ts";

export const priceInvariant = z.coerce
  .number()
  .positive()
  .optional()
  .nullable()
  .transform((v) => (v ? v * 100 : v));

export const checkboxInvariant = z
  .enum(["on", "off"])
  .optional()
  .nullable()
  .transform((v) => v === "on");

export const planInvariants = z.object({
  name: z.string().nonempty(),
  description: z.string().optional().nullable(),
  yearly: checkboxInvariant,
  monthly: checkboxInvariant,
  yearlyPrice: priceInvariant,
  monthlyPrice: priceInvariant,
  monthlyCurrency: z.enum(["usd", "eur"]).optional().default("eur"),
  yearlyCurrency: z.enum(["usd", "eur"]).optional().default("eur"),
});

export const updatePlan = makeDomainFunction(
  planInvariants,
  z.object({
    user: z.object({
      id: z.string(),
    }),
    productId: z.string(),
  })
)(
  async (
    {
      name,
      description,
      yearly,
      monthly,
      yearlyPrice,
      monthlyPrice,
      monthlyCurrency,
      yearlyCurrency,
    },
    { productId }
  ) => {
    const product = await prisma.product.findFirstOrThrow({
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
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        description,
      },
    });

    const stripeProduct = await stripe.products.update(
      product.stripeProductId,
      {
        name,
        description: description || undefined,
      }
    );
    invariant(stripeProduct, "Stripe product was not found");

    await applyPricesChanges({
      product,
      active: monthly,
      amount: monthlyPrice,
      currency: monthlyCurrency,
      stripeProduct,
      interval: "month",
    });
    await applyPricesChanges({
      product,
      active: yearly,
      amount: yearlyPrice,
      currency: yearlyCurrency,
      stripeProduct,
      interval: "year",
    });

    return product;
  }
);

export const applyPricesChanges = async ({
  product,
  active,
  amount,
  currency,
  stripeProduct,
  interval,
}: {
  product: Product & { prices: Price[] };
  active: boolean;
  amount: number | null | undefined;
  currency: string;
  stripeProduct: Stripe.Response<Stripe.Product>;
  interval: "month" | "year";
}) => {
  const changes = discriminatePriceChanges({
    prices: product.prices,
    interval: interval,
    newActive: Boolean(active && amount),
    newAmount: amount,
  });
  console.log("PRICE CHANGES INTENT", changes.intent);
  switch (changes.intent) {
    case "PRICE_DEACTIVATED":
      await stripe.prices.update(changes.currentPrice.id, {
        active: false,
      });
      await prisma.price.update({
        where: {
          id: changes.currentPrice.id,
        },
        data: {
          active: false,
        },
      });
      break;
    case "PRICE_AMOUNT_CHANGED":
    case "PRICE_CREATED":
      if (changes.intent === "PRICE_AMOUNT_CHANGED") {
        // Deactivate old ones
        await stripe.prices.update(changes.currentPrice.id, {
          active: false,
        });
        await prisma.price.update({
          where: {
            id: changes.currentPrice.id,
          },
          data: {
            active: false,
          },
        });
      }
      const newPrice = await stripe.prices.create({
        nickname: `${product.name} - ${interval}ly`,
        unit_amount: amount || 0,
        currency: currency,
        recurring: {
          interval,
        },
        tax_behavior: "inclusive",
        product: stripeProduct.id,
      });
      invariant(newPrice, `Stripe ${interval}ly price was not created`);
      await prisma.price.create({
        data: {
          amount: amount || 0,
          currency: currency,
          interval,
          product: {
            connect: {
              id: product.id,
            },
          },
          type: "recurring",
          id: newPrice.id,
        },
      });
      break;
    case "NO_PRICE_CHANGE":
      break;
  }
};

export const discriminatePriceChanges = ({
  prices,
  interval,
  newActive,
  newAmount,
}: {
  prices: Price[];
  interval: "month" | "year";
  newActive: boolean;
  newAmount?: number | null;
}):
  | {
      intent: "PRICE_CREATED" | "NO_PRICE_CHANGE";
    }
  | {
      intent: "PRICE_DEACTIVATED" | "PRICE_AMOUNT_CHANGED";
      currentPrice: Price;
    } => {
  const currentPrice = prices.find((price) => price.interval === interval);
  // Price did not exist
  if (!currentPrice && newActive && newAmount) {
    return {
      intent: "PRICE_CREATED",
    };
  }

  // Price existed and was active
  if (currentPrice && currentPrice.active) {
    if (!newActive) {
      return { currentPrice, intent: "PRICE_DEACTIVATED" };
    }
    if (currentPrice.amount !== newAmount) {
      return { currentPrice, intent: "PRICE_AMOUNT_CHANGED" };
    }
  }

  // Price existed and was inactive
  if (currentPrice && !currentPrice.active && newActive) {
    console.log("This shouldnt happen");
    return { intent: "PRICE_CREATED" };
  }
  return { intent: "NO_PRICE_CHANGE" };
};
