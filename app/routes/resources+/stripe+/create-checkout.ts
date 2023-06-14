import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { getDefaultCurrency } from "~/utils/locales.ts";
import { auth } from "~/storage/auth.server.tsx";
import { getCustomerById } from "~/models/customer.server.ts";
import { getProductById } from "~/models/product.server.ts";
import { createStripeCheckoutSession } from "~/services/stripe/create-checkout.ts";

export async function loader({ request }: DataFunctionArgs) {
  await auth.isAuthenticated(request, { failureRedirect: "/login" });
  return redirect("/account");
}

export async function action({ request }: DataFunctionArgs) {
  const session = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const customer = await getCustomerById(session.id);
  if (!customer) return redirect("/login");
  if (!customer.stripeCustomerId) throw new Error("Unable to get Customer ID.");

  // Get form values.
  const formData = Object.fromEntries(await request.formData());
  const formDataParsed = JSON.parse(formData.product as string);
  const productId = String(formDataParsed.productId);
  const planInterval = String(formDataParsed.planInterval);

  if (!productId || !planInterval)
    throw new Error(
      "Missing required parameters to create Stripe Checkout Session."
    );

  // Get client's currency.
  const defaultCurrency = getDefaultCurrency(request);

  // Get price ID for the requested plan.
  const product = await getProductById(productId, { prices: true });
  const productPrice = product?.prices.find(
    (price) =>
      price.interval === planInterval && price.currency === defaultCurrency
  );
  if (!productPrice) throw new Error("Unable to find a Plan price.");

  // Redirect to Checkout.
  const checkoutUrl = await createStripeCheckoutSession(
    customer.stripeCustomerId,
    productPrice.id
  );
  return redirect(checkoutUrl);
}
