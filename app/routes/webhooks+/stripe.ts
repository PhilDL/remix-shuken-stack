// Required for an enhanced experience with Stripe Event Types.
// More info: https://bit.ly/3KlNXLs
/// <reference types="stripe-event-types" />
import { json, type DataFunctionArgs } from "@remix-run/node";
import type { Stripe } from "stripe";

import { getCustomerByStripeId } from "~/models/customer.server.ts";
import {
  deleteSubscriptionById,
  getSubscriptionById,
  updateSubscriptionByCustomerId,
} from "~/models/subscription.server.ts";
import { stripe } from "~/services/stripe/config.server.ts";
import { PlanId } from "~/services/stripe/plans.ts";
import { retrieveStripeSubscription } from "~/services/stripe/retrieve-subscription.ts";
import { env } from "~/env.ts";

/**
 * Gets Stripe event signature from request header.
 */
async function getStripeEvent(request: Request) {
  try {
    // Get header Stripe signature.
    const signature = request.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing Stripe signature.");

    // const ENDPOINT_SECRET =
    //   process.env.NODE_ENV === "development"
    //     ? process.env.DEV_STRIPE_WEBHOOK_ENDPOINT
    //     : process.env.PROD_STRIPE_WEBHOOK_ENDPOINT;

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SIGNATURE
    ) as Stripe.DiscriminatedEvent;

    return event;
  } catch (err: unknown) {
    console.log(err);
    return json({}, { status: 400 });
  }
}

export async function action({ request }: DataFunctionArgs) {
  const event = await getStripeEvent(request);

  try {
    switch (event.type) {
      // Occurs when a Checkout Session has been successfully completed.
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = String(session.customer);
        const subscriptionId = String(session.subscription);

        // Get user from database.
        const user = await getCustomerByStripeId(customerId);
        if (!user) throw new Error("Customer not found.");

        // Retrieve and update database subscription.
        const subscription = await retrieveStripeSubscription(subscriptionId);
        await updateSubscriptionByCustomerId(user.id, {
          id: subscription.id,
          planId: String(subscription.items.data[0].plan.product),
          priceId: String(subscription.items.data[0].price.id),
          interval: String(subscription.items.data[0].plan.interval),
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        return json({}, { status: 200 });
      }

      // Occurs whenever a subscription changes (e.g. plan switch).
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = String(subscription.customer);

        // Get user from database.
        const user = await getCustomerByStripeId(customerId);
        if (!user) throw new Error("User not found.");

        // Cancel free subscription if user has a paid one.
        const subscriptionsList = await stripe.subscriptions.list({ limit: 3 });
        const freeSubscription = subscriptionsList.data
          .map((subscription) => {
            return subscription.items.data.find(
              (item) => item.price.product === PlanId.FREE
            );
          })
          .filter((item) => item !== undefined);

        if (freeSubscription[0]) {
          await stripe.subscriptions.del(freeSubscription[0].subscription);
        }

        // Update database subscription.
        await updateSubscriptionByCustomerId(user.id, {
          id: subscription.id,
          planId: String(subscription.items.data[0].plan.product),
          priceId: String(subscription.items.data[0].price.id),
          interval: String(subscription.items.data[0].plan.interval),
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        return json({}, { status: 200 });
      }

      // Occurs whenever a customer’s subscription ends.
      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        // Get database subscription.
        const dbSubscription = await getSubscriptionById(subscription.id);

        if (dbSubscription) {
          // Delete database subscription.
          await deleteSubscriptionById(subscription.id);
        }

        return json({}, { status: 200 });
      }
    }
  } catch (err: unknown) {
    console.log(err);
    return json({}, { status: 400 });
  }

  // We'll return a 200 status code for all other events.
  // A `501 Not Implemented` or any other status code could be returned.
  return json({}, { status: 200 });
}
