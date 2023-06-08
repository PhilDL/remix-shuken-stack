import type { Customer } from "@prisma/client";

import { stripe } from "~/services/stripe/config.server.ts";

export async function deleteStripeCustomer(
  stripeCustomerId?: Customer["stripeCustomerId"]
) {
  if (!stripeCustomerId)
    throw new Error("Missing required parameters to delete Stripe Customer.");

  return stripe.customers.del(stripeCustomerId);
}
