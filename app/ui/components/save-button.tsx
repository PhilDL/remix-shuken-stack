import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCheck, Loader, Save } from "lucide-react";

import { cn } from "~/ui/utils.ts";
import { buttonVariants } from "./button.tsx";

const buttonIconVariants = cva("mr-1", {
  variants: {
    size: {
      default: "h-5 w-5",
      sm: "h-4 w-4",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface SaveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  navigationState: "submitting" | "idle" | "loading";
}

const SaveButton = React.forwardRef<HTMLButtonElement, SaveButtonProps>(
  (
    { className, variant, size, children, navigationState, disabled, ...props },
    ref
  ) => {
    const [buttonIcon, setButtonIcon] = React.useState<React.ReactNode>(
      <Save className={cn(buttonIconVariants({ size }))} />
    );
    const [saved, setSaved] = React.useState(false);

    React.useEffect(() => {
      if (navigationState === "submitting") {
        setButtonIcon(
          <Loader
            className={cn(buttonIconVariants({ size }), "animate-spin")}
          />
        );
        setSaved(true);
      } else {
        if (saved) {
          setButtonIcon(
            <CheckCheck
              className={cn(buttonIconVariants({ size }), "animate-pulse")}
            />
          );
          setTimeout(() => {
            setSaved(false);
            setButtonIcon(
              <Save className={cn(buttonIconVariants({ size }))} />
            );
          }, 1000);
        }
      }
    }, [navigationState, saved, size]);
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          "flex flex-row items-center justify-center transition-all"
        )}
        ref={ref}
        disabled={disabled || navigationState === "submitting"}
        {...props}
      >
        {buttonIcon} {children}
      </button>
    );
  }
);
SaveButton.displayName = "SaveButton";

export { SaveButton };
