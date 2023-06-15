import { makeDomainFunction } from "domain-functions";
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

export const createNewPlan = makeDomainFunction(
  planInvariants,
  z.object({
    id: z.string(),
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
    user
  ) => {
    const stripeProduct = await stripe.products.create({
      name,
      description: description || undefined,
    });
    invariant(stripeProduct, "Stripe product was not created");
    const product = await prisma.product.create({
      data: {
        name,
        description,
        stripeProductId: stripeProduct.id,
      },
    });
    if (yearly && yearlyPrice) {
      const stripeYearlyPrice = await stripe.prices.create({
        nickname: `${product.name} - Yearly`,
        unit_amount: yearlyPrice,
        currency: yearlyCurrency,
        recurring: {
          interval: "year",
        },
        tax_behavior: "inclusive",
        product: stripeProduct.id,
      });
      invariant(stripeYearlyPrice, "Stripe yearly price was not created");
      await prisma.price.create({
        data: {
          amount: yearlyPrice,
          currency: yearlyCurrency,
          interval: "year",
          product: {
            connect: {
              id: product.id,
            },
          },
          type: "recurring",
          id: stripeYearlyPrice.id,
        },
      });
    }
    if (monthly && monthlyPrice) {
      const stripeMonthlyPrice = await stripe.prices.create({
        nickname: `${product.name} - Monhtly`,
        unit_amount: monthlyPrice,
        currency: monthlyCurrency,
        recurring: {
          interval: "month",
        },
        tax_behavior: "inclusive",
        product: stripeProduct.id,
      });
      invariant(stripeMonthlyPrice, "Stripe monthly price was not created");
      await prisma.price.create({
        data: {
          amount: monthlyPrice,
          currency: monthlyCurrency,
          interval: "month",
          product: {
            connect: {
              id: product.id,
            },
          },
          type: "recurring",
          id: stripeMonthlyPrice.id,
        },
      });
    }
    return product;
  }
);
