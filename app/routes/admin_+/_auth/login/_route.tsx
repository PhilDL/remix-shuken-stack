import * as React from "react";
import {
  json,
  type ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { clsx } from "clsx";
import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/ui/components/alert.tsx";
import { Button } from "~/ui/components/button.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { useTheme } from "~/ui/components/theme-provider.tsx";
import { auth } from "~/storage/auth.server.ts";
import { getAdminSession } from "~/storage/session.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    successRedirect: "/admin",
  });
  let session = await getAdminSession(request);
  let error = session.get(auth.sessionErrorKey);
  return json({ error });
}

export async function action({ request }: ActionArgs) {
  return await auth.authenticate("user-pass", request, {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
  });
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Admin Login",
    },
  ];
};

export default function LoginPage() {
  const { error } = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const emailRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className={clsx(
        "flex min-h-full flex-col justify-center bg-slate-50 dark:bg-slate-950",
        theme
      )}
    >
      {error && error.message && (
        <Alert className="mx-auto mb-6 w-full max-w-md" variant={"destructive"}>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Couldn't sign you in.</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
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

          <Button type="submit">Log in</Button>
        </Form>
      </div>
    </div>
  );
}
