import type { DataFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { auth } from "~/storage/auth.server.tsx";
import { getCustomerById } from "~/models/customer.server.ts";
import { createStripeCustomerPortalSession } from "~/services/stripe/create-customer-portal.ts";

export async function loader({ request }: DataFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return redirect("/account");
}

export async function action({ request }: DataFunctionArgs) {
  const session = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const customer = await getCustomerById(session.id);
  if (!customer) return redirect("/login");

  // Redirect to Customer Portal.
  if (customer.stripeCustomerId) {
    const customerPortalUrl = await createStripeCustomerPortalSession(
      customer.stripeCustomerId
    );
    return redirect(customerPortalUrl);
  }

  return json({}, { status: 400 });
}
