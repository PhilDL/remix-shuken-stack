import React from "react";
import { useFetcher } from "@remix-run/react";
import type Stripe from "stripe";

import { Badge } from "~/ui/components/badge.tsx";
import { Button } from "../button.tsx";
import { ProductPrice } from "./product-price.tsx";

export type StripeProductProps = React.HTMLAttributes<HTMLDivElement> & {
  product: Stripe.Product;
  prices: Stripe.Price[];
  associatedPlan?: {
    id: string;
  };
};

export const formatCurrency = (amount: number | null, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format((amount || 0) / 100);
};

const StripeProduct = React.forwardRef<HTMLDivElement, StripeProductProps>(
  ({ className, product, prices, associatedPlan, ...props }, ref) => {
    const fetcher = useFetcher();

    return (
      <div
        key={product.id}
        className="flex flex-col gap-4 rounded-md border bg-card p-4 text-card-foreground shadow-sm"
      >
        <div className="flex flex-row items-baseline justify-between gap-4">
          <h2 className="line-clamp-2 font-semibold">{product.name}</h2>
          <div className="flex flex-row gap-2">
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
            {associatedPlan ? (
              <Badge
                variant={"outline"}
                className="flex flex-row items-center justify-between gap-2"
              >
                Associated{" "}
                <span className="flex-none animate-pulse rounded-full bg-lime-500/10 p-1 text-lime-500 animate-in">
                  <span className="flex h-2 w-2 rounded-full bg-lime-500" />
                </span>
              </Badge>
            ) : (
              <fetcher.Form
                method="post"
                action="/admin/settings/stripe/associate-plan"
              >
                <input
                  type="hidden"
                  name="productId"
                  value={product.id}
                  readOnly
                />
                <Button
                  type="submit"
                  className="flex h-auto flex-row items-center justify-between gap-2 rounded-full py-1 text-xs"
                  size={"sm"}
                  disabled={fetcher.formData?.get("productId") === product.id}
                >
                  Associate{" "}
                  <span className="flex-none animate-pulse rounded-full bg-gray-500/10 p-1 text-gray-500 animate-in">
                    <span className="flex h-2 w-2 rounded-full bg-gray-500" />
                  </span>
                </Button>
              </fetcher.Form>
            )}
          </div>
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
                  <ProductPrice
                    type={price.type}
                    amount={price.unit_amount}
                    currency={price.currency}
                    interval={price.recurring?.interval}
                  />
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
