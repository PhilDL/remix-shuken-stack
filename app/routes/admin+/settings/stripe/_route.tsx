import { Suspense } from "react";
import { defer, type LoaderArgs } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";

import { StripeProduct } from "~/ui/components/admin/stripe-product.tsx";
import { Badge } from "~/ui/components/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/components/card.tsx";
import { Skeleton } from "~/ui/components/skeleton.tsx";
import { getAllProductsAndPrice } from "~/services/stripe/products.server.ts";

export async function loader({ request }: LoaderArgs) {
  const products = getAllProductsAndPrice();
  return defer({ products });
}

export default function SettingsStripe() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stripe Products</CardTitle>
          <CardDescription>
            <div className="flex flex-row justify-between">
              Connected stripe Account
              <Badge
                variant={"outline"}
                className="flex flex-row items-start justify-between gap-3"
              >
                Connected{" "}
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-lime-500" />
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Suspense
            fallback={
              <div className="grid w-full items-center gap-5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            }
          >
            <Await
              resolve={data.products}
              errorElement={<p>Error loading Stripe products!</p>}
            >
              {(products) => (
                <>
                  {products.map(({ product, prices }) => (
                    <StripeProduct
                      key={product.id}
                      product={product}
                      prices={prices}
                    />
                  ))}
                </>
              )}
            </Await>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
