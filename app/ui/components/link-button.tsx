import * as React from "react";
import { Link, type LinkProps } from "@remix-run/react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "~/ui/utils.ts";
import { buttonVariants } from "./button.tsx";

export interface LinkButtonProps
  extends LinkProps,
    VariantProps<typeof buttonVariants> {}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <Link
        className={cn(
          "no-underline",
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        {...props}
      >
        {props.children}
      </Link>
    );
  }
);
LinkButton.displayName = "LinkButton";

export { LinkButton };
