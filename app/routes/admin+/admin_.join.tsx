import * as React from "react";
import {
  type ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { clsx } from "clsx";
import { inputFromForm } from "domain-functions";

import { Button } from "~/ui/components/button.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { useTheme } from "~/ui/components/theme-provider.tsx";
import {
  addFlashMessage,
  redirectWithFlashMessage,
  wrapDomainErrorJSON,
} from "~/storage/flash-message.server.ts";
import { createStaffAdminUser } from "~/domain/admin/users.server.ts";

export async function loader({ request }: LoaderArgs) {
  return {};
}

export async function action({ request }: ActionArgs) {
  const createUserOperation = await createStaffAdminUser(
    await inputFromForm(request)
  );
  if (!createUserOperation.success) {
    return wrapDomainErrorJSON(createUserOperation, request);
  }
  const flash = await addFlashMessage(request, {
    type: "success",
    title: "Operation OK",
    message: "User created successfully",
  });
  return redirectWithFlashMessage("/admin/login", flash);
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Staff Join",
    },
  ];
};

export default function LoginPage() {
  const [theme] = useTheme();
  const emailRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className={clsx(
        "flex min-h-full flex-col justify-center bg-slate-50 dark:bg-slate-950",
        theme
      )}
    >
      <div className="mx-auto w-full max-w-md rounded-md bg-white p-8 text-slate-900 dark:bg-slate-900 dark:text-slate-50 ">
        <Form method="post" className="space-y-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              ref={emailRef}
              id="email"
              required
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              aria-describedby="email-error"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              required
              name="password"
              type="password"
              autoComplete="password"
              aria-describedby="password-error"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="secretkey">Secret Key</Label>
            <Input
              id="secretkey"
              required
              autoFocus={true}
              name="secretkey"
              type="secretkey"
              autoComplete="secretkey"
              aria-describedby="secretkey-error"
            />
          </div>

          <Button type="submit">Log in</Button>
        </Form>
      </div>
    </div>
  );
}
