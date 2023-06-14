import { useState } from "react";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CheckIcon } from "lucide-react";

import { getDefaultCurrency } from "~/utils/locales.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/components/card.tsx";
import { LinkButton } from "~/ui/components/link-button.tsx";
import { CheckoutButton } from "~/ui/components/stripe/checkout-button.tsx";
import { Switch } from "~/ui/components/switch.tsx";
import { auth } from "~/storage/auth.server.tsx";
import { getSubscriptionByCustomerId } from "~/models/subscription.server.ts";
import { Currency, Interval, PRICING_PLANS } from "~/services/stripe/plans.ts";

export async function loader({ request }: DataFunctionArgs) {
  const session = await auth.isAuthenticated(request);
  const subscription = session?.id
    ? await getSubscriptionByCustomerId(session.id)
    : null;

  // Get client's currency.
  const defaultCurrency = getDefaultCurrency(request);

  return json({
    user: session,
    subscription,
    defaultCurrency,
  });
}

export default function Plans() {
  const { user, subscription, defaultCurrency } =
    useLoaderData<typeof loader>();
  const [planInterval, setPlanInterval] = useState<Interval | string>(
    subscription?.interval || Interval.MONTH
  );

  return (
    <div className="flex w-full flex-col items-center justify-start px-6 md:h-full">
      {/* Header. */}
      <div className="flex flex-col items-center">
        <h3 className="text-3xl font-bold ">Select your plan</h3>
        <div className="my-1" />
        <p className="text-center font-semibold text-muted-foreground">
          You can test the upgrade and won't be charged.
        </p>
      </div>
      <div className="my-1" />

      {/* Toggler. */}
      <div className="my-4 flex flex-col items-center justify-center">
        <div className="text-center font-bold">
          {planInterval === Interval.MONTH ? "Monthly" : "Yearly"}
        </div>
        <div className="my-2" />

        <label htmlFor="toggle" className="flex cursor-pointer items-center">
          <div className="relative">
            <Switch
              id="toggle"
              checked={planInterval === Interval.YEAR}
              onClick={() =>
                setPlanInterval((prev) =>
                  prev === Interval.MONTH ? Interval.YEAR : Interval.MONTH
                )
              }
            />
          </div>
        </label>
      </div>

      {/* Plans. */}
      <div className="flex w-full max-w-6xl flex-col items-center py-3 md:flex-row md:justify-center">
        {Object.values(PRICING_PLANS).map((plan) => {
          return (
            <Card
              key={plan.id}
              className={`mx-2 flex min-w-[280px] flex-col items-center px-6 py-3 transition hover:opacity-100 ${
                user && subscription?.productId === plan.id
                  ? "opacity-100"
                  : "opacity-40"
              }`}
            >
              <CardHeader className="text-center">
                <CardTitle>{plan.name}!</CardTitle>
                <CardDescription>Tier Description</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Price Amount. */}
                <h5 className="flex flex-row items-center text-5xl font-bold">
                  {defaultCurrency === Currency.EUR ? "€" : "$"}
                  {planInterval === Interval.MONTH
                    ? plan.prices[Interval.MONTH][defaultCurrency] / 100
                    : plan.prices[Interval.YEAR][defaultCurrency] / 100}
                  <small className="relative left-1 top-2 text-lg text-muted-foreground">
                    {planInterval === Interval.MONTH ? "/mo" : "/yr"}
                  </small>
                </h5>
                <div className="my-3" />

                {/* Features. */}
                {plan.features.map((feature) => {
                  return (
                    <div key={feature} className="flex flex-row items-center">
                      <CheckIcon className="h-6 w-6" />
                      <div className="mx-1" />
                      <p className="flex flex-row whitespace-nowrap text-center text-base font-medium text-muted-foreground">
                        {feature}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
              <CardFooter>
                {user && (
                  <CheckoutButton
                    currentPlanId={subscription?.productId ?? null}
                    productId={plan.id}
                    planName={plan.name}
                    planInterval={planInterval}
                  />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {!user && (
        <LinkButton to="/login" prefetch="intent">
          Get Started
        </LinkButton>
      )}
    </div>
  );
}
