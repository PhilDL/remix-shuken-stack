import { stripe } from "~/services/stripe/config.server.ts";
import type { PlanId } from "~/services/stripe/plans.ts";

type BillingPortalProducts = {
  product: PlanId;
  prices: string[];
};

export async function configureStripeCustomerPortal(
  products: BillingPortalProducts[]
) {
  if (!products)
    throw new Error(
      "Missing required parameters to configure Stripe Customer Portal."
    );

  return stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Organization Name - Customer Portal",
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["address", "shipping", "tax_id", "email"],
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_pause: { enabled: false },
      subscription_cancel: { enabled: true },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "always_invoice",
        products: products.filter(({ product }) => product !== "free"),
      },
    },
  });
}
