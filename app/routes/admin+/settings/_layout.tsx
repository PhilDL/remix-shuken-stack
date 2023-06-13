import { forwardRef } from "react";
import { json, type LoaderArgs } from "@remix-run/node";
import { NavLink, Outlet, type NavLinkProps } from "@remix-run/react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { cn } from "~/ui/utils.ts";
import { auth } from "~/storage/admin-auth.server.ts";

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
