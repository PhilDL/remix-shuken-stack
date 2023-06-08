import * as React from "react";
import { NavLink, type NavLinkProps } from "@remix-run/react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "~/ui/utils.ts";
import { buttonVariants } from "./button.tsx";

export interface NavLinkButtonProps
  extends NavLinkProps,
    VariantProps<typeof buttonVariants> {}

const NavLinkButton = React.forwardRef<HTMLAnchorElement, NavLinkButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <NavLink
        className={cn(
          "no-underline",
          buttonVariants({ variant, size }),
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
NavLinkButton.displayName = "NavLinkButton";

export { NavLinkButton, buttonVariants };
