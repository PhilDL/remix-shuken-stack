// import { redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

import { adminSessionStorage } from "~/storage/session.server.ts";
import { verifyLogin } from "~/models/user.server.ts";
import { prisma } from "./db.server.ts";

/** @tutorial Sessions stored in DB - Uncomment to activate */
// const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;

export let auth = new Authenticator<{ id: string }>(adminSessionStorage);

auth.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email") as string;
    let password = form.get("password") as string;
    let user = await verifyLogin(email, password);
    if (!user) throw new Error("Invalid email or password");
    /** @tutorial Sessions stored in DB - Uncomment to activate */
    // const session = await prisma.session.create({
    //   data: {
    //     expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
    //     userId: user.id,
    //   },
    //   select: { id: true },
    // });
    // return { id: session.id };
    return { id: user.id };
  }),
  "user-pass"
);

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const requestUrl = new URL(request.url);
  redirectTo =
    redirectTo === null
      ? null
      : redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`;
  const loginParams = redirectTo
    ? new URLSearchParams([["redirectTo", redirectTo]])
    : null;
  const failureRedirect = ["/admin/login", loginParams?.toString()]
    .filter(Boolean)
    .join("?");
  const user = await auth.isAuthenticated(request, {
    failureRedirect,
  });
  /** @tutorial Sessions stored in DB - Uncomment to activate */
  // const session = await prisma.session.findFirst({
  //   where: { id: user.id },
  //   select: { userId: true, expirationDate: true },
  // });
  // if (!session) {
  //   await auth.logout(request, { redirectTo: failureRedirect });
  //   throw redirect(failureRedirect);
  // }
  // return session.userId;
  return user.id;
}

export async function requireUser(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const userId = await requireUserId(request, { redirectTo });
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function getUserId(request: Request) {
  const user = await auth.isAuthenticated(request);
  if (!user) return null;
  /** @tutorial Sessions stored in DB - Uncomment to activate */
  // const session = await prisma.session.findUnique({
  //   where: { id: user.id },
  //   select: { userId: true },
  // });
  // if (!session) {
  //   // Perhaps their session was deleted?
  //   await auth.logout(request, { redirectTo: "/" });
  //   return null;
  // }
  // return session.userId;
  return user.id;
}

export async function requireAnonymous(request: Request) {
  await auth.isAuthenticated(request, {
    successRedirect: "/",
  });
}
