import type { Customer, Subscription } from "@prisma/client";

import { prisma } from "~/storage/db.server.ts";

export async function getSubscriptionById(id: Subscription["id"]) {
  return prisma.subscription.findUnique({
    where: { id },
  });
}

export async function getSubscriptionByCustomerId(customerId: Customer["id"]) {
  return prisma.subscription.findUnique({
    where: { customerId },
  });
}

export async function createSubscription(
  subscription: Omit<Subscription, "createdAt" | "updatedAt">
) {
  return prisma.subscription.create({
    data: { ...subscription },
  });
}

export async function updateSubscriptionById(
  id: Subscription["id"],
  subscription: Partial<Subscription>
) {
  return prisma.subscription.update({
    where: { id },
    data: { ...subscription },
  });
}

export async function updateSubscriptionByCustomerId(
  customerId: Subscription["customerId"],
  subscription: Partial<Subscription>
) {
  return prisma.subscription.update({
    where: { customerId },
    data: { ...subscription },
  });
}

export async function deleteSubscriptionById(id: Subscription["id"]) {
  return prisma.subscription.delete({
    where: { id },
  });
}
