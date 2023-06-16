import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { getDefaultCurrency } from "~/utils/locales.ts";
import { auth } from "~/storage/public-auth.server.tsx";
import { getCustomerById } from "~/models/customer.server.ts";
import { getProductById } from "~/models/product.server.ts";
import {
  createSubscription,
  getSubscriptionByCustomerId,
} from "~/models/subscription.server.ts";
import { createStripeSubscription } from "~/providers/stripe/create-subscription.ts";
import { PlanId } from "~/providers/stripe/plans.ts";

export async function loader({ request }: DataFunctionArgs) {
  const session = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const customer = await getCustomerById(session.id);
  if (!customer) return redirect("/login");

  const subscription = await getSubscriptionByCustomerId(customer.id);
  if (subscription?.id) return redirect("/account");
  if (!customer.stripeCustomerId)
    throw new Error("Unable to find Customer ID.");

  // Get client's currency and Free Plan price ID.
  const currency = getDefaultCurrency(request);
  const freePlan = await getProductById(PlanId.FREE, { prices: true });
  const freePlanPrice = freePlan?.prices.find(
    (price) => price.interval === "year" && price.currency === currency
  );
  if (!freePlanPrice) throw new Error("Unable to find Free Plan price.");

  // Create Stripe Subscription.
  const newSubscription = await createStripeSubscription(
    customer.stripeCustomerId,
    freePlanPrice.id
  );
  if (!newSubscription)
    throw new Error("Unable to create Stripe Subscription.");

  // Store Subscription into database.
  const storedSubscription = await createSubscription({
    id: newSubscription.id,
    customerId: customer.id,
    productId: String(newSubscription.items.data[0].plan.product),
    priceId: String(newSubscription.items.data[0].price.id),
    interval: String(newSubscription.items.data[0].plan.interval),
    status: newSubscription.status,
    currentPeriodStart: newSubscription.current_period_start,
    currentPeriodEnd: newSubscription.current_period_end,
    cancelAtPeriodEnd: newSubscription.cancel_at_period_end,
  });
  if (!storedSubscription) throw new Error("Unable to create Subscription.");

  return redirect("/account");
}
