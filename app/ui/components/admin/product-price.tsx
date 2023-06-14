import React from "react";

import { formatCurrency } from "./stripe-product.tsx";

export type ProductPriceProps = React.HTMLAttributes<HTMLSpanElement> & {
  type: "one_time" | "recurring";
  amount: number | null;
  currency: string;
  interval?: "day" | "month" | "week" | "year" | null;
};

export const ProductPrice = React.forwardRef<
  HTMLSpanElement,
  ProductPriceProps
>(({ className, type, amount, currency, interval, ...props }, ref) => {
  if (type === "one_time") {
    return (
      <span className={className} ref={ref} {...props}>
        {formatCurrency(amount, currency)}
      </span>
    );
  }
  return (
    <span className={className} ref={ref} {...props}>
      <b>{formatCurrency(amount, currency)}</b>
      <i className="text-xs text-muted-foreground">
        {" / "}
        {interval || ""}
      </i>
    </span>
  );
});

ProductPrice.displayName = "StripeProductPrice";
