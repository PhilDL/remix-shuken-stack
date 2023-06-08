import { type User } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

import { adminSessionStorage } from "~/storage/session.server.ts";
import { verifyLogin } from "~/models/user.server.ts";

export let auth = new Authenticator<User>(adminSessionStorage);

// Here we need the sendEmail, the secret and the URL where the user is sent
// after clicking on the magic link
auth.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email") as string;
    let password = form.get("password") as string;
    let user = await verifyLogin(email, password);
    if (!user) throw new Error("Invalid email or password");
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);
