import bcrypt from "bcryptjs";
import { makeDomainFunction, ResultError } from "domain-functions";
import * as z from "zod";

import { prisma } from "~/storage/db.server.ts";
import { verifyLoginForUserId } from "~/models/user.server.ts";

export const inputChangePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty(),
    password: z.string().min(5),
    confirmPassword: z.string().min(5),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "The passwords did not match",
      });
    }
  });

export const changePassword = makeDomainFunction(
  inputChangePasswordSchema,
  z.object({
    id: z.string(),
  })
)(async ({ oldPassword, password }, user) => {
  const existingUser = await verifyLoginForUserId(user.id, oldPassword);
  if (!existingUser) {
    throw new ResultError({
      errors: [],
      inputErrors: [
        {
          path: ["oldPassword"],
          message: "This password did not match our credentials",
        },
      ],
      environmentErrors: [],
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: {
        update: {
          hash: hashedPassword,
        },
      },
    },
  });
  return updatedUser;
});
