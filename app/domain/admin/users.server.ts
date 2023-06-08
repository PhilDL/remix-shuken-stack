import { makeDomainFunction } from "domain-functions";
import * as z from "zod";

import { createAdminUser } from "~/models/user.server.ts";
import { env } from "~/env.ts";

export const userSchema = z.object({
  email: z.string().nonempty(),
  password: z.string().nonempty(),
  secretkey: z.string().nonempty(),
});

export const createStaffAdminUser = makeDomainFunction(userSchema)(
  async ({ email, password, secretkey }) => {
    if (secretkey !== env.SEED_ADMIN_PASSWORD) {
      throw new Error("Invalid secret key");
    }
    const newUser = await createAdminUser(email, password);
    return newUser;
  }
);
