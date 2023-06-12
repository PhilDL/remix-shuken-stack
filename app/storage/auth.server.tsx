import type { Customer } from "@prisma/client";
import { render } from "@react-email/render";
import { Authenticator } from "remix-auth";
import { OTPStrategy } from "remix-auth-otp";

import { prisma } from "~/storage/db.server.ts";
import { sessionStorage } from "~/storage/session.server.ts";
import { getSiteSettings } from "~/models/settings.server.ts";
import { sendEmail } from "~/services/email.server.tsx";
import { SignInEmail } from "~/emails/sign-in-email.tsx";
import { SignUpEmail } from "~/emails/sign-up-email.tsx";
import { env } from "~/env.ts";

// This secret is used to encrypt the token sent in the magic link and the
// session used to validate someone else is not trying to sign-in as another
// user.
let secret = env.MAGIC_LINK_SECRET;
if (!secret) throw new Error("Missing MAGIC_LINK_SECRET env variable.");

export type CustomerSession = Pick<
  Customer,
  "name" | "email" | "subscribed" | "comped" | "status" | "avatarImage" | "id"
> & {
  subscription?: {
    id: string;
    status: string;
  } | null;
};

export let auth = new Authenticator<CustomerSession>(sessionStorage);

// const api = new TSGhostAdminAPI(env.GHOST_URL, env.GHOST_ADMIN_API_KEY, "v5.0");
// const userQuery =

// Here we need the sendEmail, the secret and the URL where the user is sent
// after clicking on the magic link
auth.use(
  new OTPStrategy(
    {
      secret,
      storeCode: async (code) => {
        await prisma.otp.create({
          data: {
            code: code,
            active: true,
            attempts: 0,
          },
        });
      },
      sendCode: async ({ email, code, magicLink, user, form, request }) => {
        const sender = {
          name: "CodingDodo",
          email: "contact@codingdodo.com",
        };
        const to = [{ email }];
        let subject = "";
        let htmlContent = "";
        const settings = await getSiteSettings();
        if (form?.get("context") === "signup") {
          subject = `🙌 Complete your signup to ${settings.title}`;
          htmlContent = render(
            <SignUpEmail
              appName={settings.title}
              magicLink={magicLink}
              loginCode={code}
              logo={settings.logo || ""}
              name={(form?.get("name") as string) || ""}
              appDescription={settings.description || ""}
            />
          );
        } else {
          subject = `🔑 Secure sign in link for ${settings.title}`;
          htmlContent = render(
            <SignInEmail
              appName={settings.title}
              magicLink={magicLink}
              loginCode={code}
              logo={settings.logo || ""}
              appDescription={settings.description || ""}
            />
          );
        }
        // Using resend.com example
        // const resend = new Resend(env.RESEND_API_KEY);
        // await resend.sendEmail({
        //   from: "onboarding@resend.dev",
        //   to: "philippe.lattention@hotmail.fr",
        //   subject: "Hello World",
        //   react: (
        //     <SignInEmail
        //       appName={settings.title}
        //       magicLink={magicLink}
        //       loginCode={code}
        //       accentColor={settings.accent_color || undefined}
        //       logo={settings.logo || ""}
        //       appDescription={settings.description}
        //     />
        //   ),
        // });
        await sendEmail({ sender, to, subject, htmlContent });
      },
      validateCode: async (code) => {
        const otp = await prisma.otp.findUnique({
          where: {
            code: code,
          },
        });
        if (!otp) throw new Error("OTP code not found.");

        return {
          code: otp.code,
          active: otp.active,
          attempts: otp.attempts,
        };
      },
      invalidateCode: async (code, active, attempts) => {
        if (!active) {
          await prisma.otp.delete({
            where: {
              code: code,
            },
          });
        } else {
          await prisma.otp.update({
            where: {
              code: code,
            },
            data: {
              active: active,
              attempts: attempts,
            },
          });
        }
      },
    },
    async ({ email, code, magicLink, form, request }) => {
      const customer = await prisma.customer.findFirstOrThrow({
        where: { email },
        include: {
          subscription: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });
      return customer;
    }
  )
);
