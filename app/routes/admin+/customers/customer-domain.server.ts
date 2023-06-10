import { makeDomainFunction } from "domain-functions";
import * as z from "zod";

import { prisma } from "~/storage/db.server.ts";

export const inputCustomerCreateSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  note: z.string().optional().nullable(),
});

export const createNewCustomer = makeDomainFunction(
  inputCustomerCreateSchema,
  z.object({
    id: z.string(),
  })
)(async ({ name, email, note }, user) => {
  const newCustomer = await prisma.customer.create({
    data: {
      name,
      email,
      note,
    },
  });
  return newCustomer;
});

export const updateCustomerAction = makeDomainFunction(
  inputCustomerCreateSchema,
  z.object({
    user: z.object({
      id: z.string(),
    }),
    id: z.string(),
  })
)(async ({ name, email, note }, { id, user }) => {
  // perform check on user role
  const updatedCustomer = await prisma.customer.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      note,
    },
  });
  return updatedCustomer;
});

export const deleteCustomerAction = makeDomainFunction(
  z.object({
    customerId: z.string(),
    action: z.literal("delete"),
  }),
  z.object({
    id: z.string(),
  })
)(async ({ customerId, action }, user) => {
  //   const userIsCustomerAuthor = await checkIsRecordAuthor(
  //     user.id,
  //     customerId,
  //     "customer"
  //   );
  //   if (!userIsCustomerAuthor) {
  //     throw new Error("You are not the author of this customer");
  //   }
  if (action !== "delete") {
    throw new Error("You must confirm the action");
  }
  const updatedCustomer = await prisma.customer.delete({
    where: {
      id: customerId,
    },
  });
  return updatedCustomer;
});
