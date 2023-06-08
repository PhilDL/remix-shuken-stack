import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { auth } from "~/storage/auth.server.tsx";
import { logout } from "~/storage/session.server.ts";
import {
  deleteCustomerById,
  getCustomerById,
} from "~/models/customer.server.ts";
import { deleteStripeCustomer } from "~/services/stripe/delete-customer.ts";

export async function loader({ request }: DataFunctionArgs) {
  await auth.isAuthenticated(request, { failureRedirect: "/login" });
  return redirect("/account");
}

export async function action({ request }: DataFunctionArgs) {
  const customerSession = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const customer = await getCustomerById(customerSession.id);
  if (!customer) return redirect("/login");

  // Delete user from database.
  await deleteCustomerById(customer.id);

  // Delete Stripe Customer.
  if (customer.stripeCustomerId)
    await deleteStripeCustomer(customer.stripeCustomerId);

  // Destroy session and logout
  return logout(request);
}
