import { makeDomainFunction } from "domain-functions";
import * as z from "zod";

import { prisma } from "~/storage/db.server.ts";

export const inputCreateMember = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
});

export const createMember = makeDomainFunction(inputCreateMember)(
  async ({ name, email }) => {
    if (
      await prisma.customer.findFirst({
        select: { id: true },
        where: { email },
      })
    ) {
      throw new Error("User already exists");
    }
    const user = await prisma.customer.create({ data: { name, email } });
    if (!user) {
      throw new Error("User could not be created");
    }
    console.log(`User ${user.name} created`, user.email);
    return {
      user,
    };
  }
);
