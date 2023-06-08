import type { Plan, Prisma } from "@prisma/client";

import { prisma } from "~/storage/db.server.ts";

export async function createPlan(plan: Omit<Plan, "createdAt" | "updatedAt">) {
  return prisma.plan.create({
    data: { ...plan },
  });
}

export async function deletePlanById(id: Plan["id"]) {
  return prisma.plan.delete({
    where: { id },
  });
}

export async function getPlanById(
  id: Plan["id"],
  include?: Prisma.PlanInclude
) {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      ...include,
      prices: include?.prices || false,
    },
  });
}

export async function getAllPlans(include?: Prisma.PlanInclude) {
  return prisma.plan.findMany({
    include: {
      ...include,
      prices: include?.prices || false,
    },
  });
}

export async function updatePlanById(id: Plan["id"], plan: Partial<Plan>) {
  return prisma.plan.update({
    where: { id },
    data: { ...plan },
  });
}
