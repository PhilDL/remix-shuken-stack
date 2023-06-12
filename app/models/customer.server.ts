import type { Customer } from "@prisma/client";

import { prisma } from "~/storage/db.server.ts";

export async function createCustomer(
  customer: Pick<Customer, "email" | "name">
) {
  return prisma.customer.create({
    data: { ...customer },
  });
}

export async function deleteCustomerById(id: Customer["id"]) {
  return prisma.customer.delete({
    where: { id },
  });
}

export async function getCustomerById(id: Customer["id"]) {
  return prisma.customer.findUnique({
    where: { id },
  });
}

export async function getCustomerByEmail(email: Customer["email"]) {
  return prisma.customer.findUnique({
    where: { email },
  });
}

export async function getCustomerByStripeId(
  stripeCustomerId: Customer["stripeCustomerId"]
) {
  if (!stripeCustomerId)
    throw new Error("Missing required parameters to retrieve Customer.");

  return prisma.customer.findUnique({
    where: { stripeCustomerId },
  });
}

export async function updateCustomerById(
  id: Customer["id"],
  customer: Partial<Customer>
) {
  return prisma.customer.update({
    where: { id },
    data: { ...customer },
  });
}

export async function getAllCustomers() {
  return prisma.customer.findMany({
    include: {
      subscription: true,
    },
  });
}
