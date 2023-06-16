import { Suspense } from "react";
import { defer, type LoaderArgs } from "@remix-run/node";
import {
  Await,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

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
import { getAllProducts } from "~/models/product.server.ts";
import { requireUserWithPermission } from "~/policies/permissions.server.ts";
import { getAllProductsAndPrice } from "~/providers/stripe/products.server.ts";

export async function loader({ request }: LoaderArgs) {
  await requireUserWithPermission("stripe.settings.write", request);
  const products = getAllProductsAndPrice();
  const plans = await getAllProducts({ prices: true });
  return defer({ products, plans });
}

export default function SettingsStripe() {
  const { products, plans } = useLoaderData<typeof loader>();
  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stripe Products</CardTitle>

          <div className="flex flex-row justify-between text-sm text-muted-foreground">
            Connected stripe Account
            <Badge
              variant={"outline"}
              className="flex flex-row items-start justify-between gap-3"
            >
              Connected{" "}
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-lime-500" />
            </Badge>
          </div>
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
              resolve={products}
              errorElement={<p>Error loading Stripe products!</p>}
            >
              {(products) => (
                <>
                  {products.map(({ product, prices }) => (
                    <StripeProduct
                      key={product.id}
                      product={product}
                      prices={prices}
                      associatedPlan={plans.find(
                        (p) => p.stripeProductId === product.id
                      )}
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

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {error.status === 403 ? "Unauthorized" : "Error"}
          </CardTitle>
          <CardDescription>{error.status}</CardDescription>
        </CardHeader>
        <CardContent>
          {error.data.requiredRole && (
            <div>
              You don't have permission{" "}
              <code className="rounded-md border border-primary bg-muted px-1 text-muted-foreground">
                {error.data.requiredRole}
              </code>{" "}
              to access this resource.
            </div>
          )}
          <pre>{error.data.message}</pre>
        </CardContent>
      </Card>
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
