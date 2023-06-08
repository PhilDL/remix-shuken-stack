import { makeDomainFunction } from "domain-functions";
import * as z from "zod";

import { prisma } from "~/storage/db.server.ts";

export const inputVerifyMember = z.object({
  email: z.string().email(),
});

export const verifyMember = makeDomainFunction(inputVerifyMember)(
  async ({ email }) => {
    const searchUser = await prisma.customer.findFirstOrThrow({
      where: { email },
    });
    if (!searchUser) {
      throw new Error("User could not be found");
    }
    return {
      user: searchUser,
    };
  }
);
