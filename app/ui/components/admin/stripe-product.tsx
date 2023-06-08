import React from "react";
import type Stripe from "stripe";

import { Badge } from "~/ui/components/badge.tsx";

export type StripeProductProps = React.HTMLAttributes<HTMLDivElement> & {
  product: Stripe.Product;
  prices: Stripe.Price[];
};

export const formatCurrency = (amount: number | null, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format((amount || 0) / 100);
};

export type StripeProductPriceProps = React.HTMLAttributes<HTMLSpanElement> & {
  price: {
    type: "one_time" | "recurring";
    unit_amount: number | null;
    currency: string;
    recurring?: { interval: "day" | "month" | "week" | "year" } | null;
  };
};

const StripeProductPrice = React.forwardRef<
  HTMLSpanElement,
  StripeProductPriceProps
>(({ className, price, ...props }, ref) => {
  if (price.type === "one_time") {
    return (
      <span className={className} ref={ref} {...props}>
        {formatCurrency(price.unit_amount, price.currency)}
      </span>
    );
  }
  return (
    <span className={className} ref={ref} {...props}>
      <b>{formatCurrency(price.unit_amount, price.currency)}</b>
      <i className="text-xs text-muted-foreground">
        {" / "}
        {price.recurring?.interval || ""}
      </i>
    </span>
  );
});

StripeProductPrice.displayName = "StripeProductPrice";

const StripeProduct = React.forwardRef<HTMLDivElement, StripeProductProps>(
  ({ className, product, prices, ...props }, ref) => {
    return (
      <div
        key={product.id}
        className="flex flex-col gap-4 rounded-md border bg-card p-4 text-card-foreground shadow-sm"
      >
        <div className="flex flex-row items-baseline justify-between gap-4">
          <h2 className="line-clamp-2 font-semibold">{product.name}</h2>
          <Badge
            variant={product.active ? "outline" : "secondary"}
            className="flex flex-row items-center justify-between gap-2"
          >
            {product.active ? "Active" : "Inactive"}{" "}
            {product.livemode ? (
              <span className="flex-none animate-pulse rounded-full bg-lime-500/10 p-1 text-lime-500 animate-in">
                <span className="flex h-2 w-2 rounded-full bg-lime-500" />
              </span>
            ) : null}
          </Badge>
        </div>
        <div className="flex flex-col gap-3">
          {prices
            .filter((price) => price.nickname !== "Complimentary")
            .map((price) => (
              <div
                className="flex flex-row items-center justify-between"
                key={price.id}
              >
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {price.nickname}
                  </h4>
                  <p className="text-xs text-muted-foreground">{price.id}</p>
                </div>

                <p className="mt-1 self-start text-foreground">
                  <StripeProductPrice price={price} />
                </p>
              </div>
            ))}
        </div>
      </div>
    );
  }
);

StripeProduct.displayName = "StripeProduct";

export { StripeProduct };
