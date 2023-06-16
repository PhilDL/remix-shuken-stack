import { json } from "@remix-run/node";

import { requireUserId } from "~/storage/auth.server.ts";
import { prisma } from "~/storage/db.server.ts";

export async function requireUserWithPermission(
  name: string,
  request: Request
) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findFirst({
    where: { id: userId, roles: { some: { permissions: { some: { name } } } } },
  });
  if (!user) {
    throw json({ error: "Unauthorized", requiredRole: name }, { status: 403 });
  }
  return user;
}

export async function requireAdmin(request: Request) {
  return requireUserWithPermission("admin", request);
}

export async function userHasPermission(userId: string, permission: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      roles: { some: { permissions: { some: { name: permission } } } },
    },
  });
  return !!user;
}
