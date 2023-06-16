import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { auth } from "~/storage/public-auth.server.tsx";
import {
  getCustomerById,
  updateCustomerById,
} from "~/models/customer.server.ts";
import { createStripeCustomer } from "~/providers/stripe/create-customer.ts";

export async function loader({ request }: DataFunctionArgs) {
  const session = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const customer = await getCustomerById(session.id);
  if (!customer) return redirect("/login");
  if (customer.stripeCustomerId) return redirect("/account");

  // Create Stripe Customer.
  const email = customer.email ? customer.email : undefined;
  const name = customer.name ? customer.name : undefined;

  const stripeCustomer = await createStripeCustomer({ email, name });
  if (!stripeCustomer) throw new Error("Unable to create Stripe Customer.");

  // Update user.
  await updateCustomerById(customer.id, {
    stripeCustomerId: stripeCustomer.id,
  });

  return redirect("/account");
}
