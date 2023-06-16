import { forwardRef } from "react";
import { json, type LoaderArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  NavLink,
  Outlet,
  useRouteError,
  type NavLinkProps,
} from "@remix-run/react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { cn } from "~/ui/utils.ts";
import { auth } from "~/storage/auth.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request);
  return json({});
}

const TabsNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <NavLink
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-current:bg-background aria-current:text-foreground aria-current:shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      >
        {props.children}
      </NavLink>
    );
  }
);
TabsNavLink.displayName = "TabsNavLink";

export default function Settings() {
  return (
    <PageContainer>
      <PageHeader title="Settings" subTitle="Handle your settings" />
      <main className="container">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsNavLink to="/admin/settings/general">General</TabsNavLink>
          <TabsNavLink to="/admin/settings/profile">Profile</TabsNavLink>
          <TabsNavLink to="/admin/settings/stripe">Stripe</TabsNavLink>
        </div>
        <div className="mt-8 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Outlet />
        </div>
      </main>
    </PageContainer>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div className="relative overflow-hidden py-16">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-prose text-lg">
            <h1>
              <span className="block text-center text-lg font-semibold">
                Nested Error
              </span>
              <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight sm:text-4xl">
                {error.status}
              </span>
            </h1>

            <pre className="mt-8 overflow-auto rounded-md border-2 text-sm leading-8">
              <code>{error.data.message}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="relative overflow-hidden py-16">
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-prose text-lg">
          <h1>
            <span className="block text-center text-lg font-semibold">
              Uh oh...
            </span>
          </h1>

          <pre className="mt-8 overflow-auto rounded-md border-2 text-sm leading-8">
            <code>{errorMessage}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
