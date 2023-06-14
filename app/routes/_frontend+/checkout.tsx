import { useState } from "react";
import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Loader } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/components/card.tsx";
import { LinkButton } from "~/ui/components/link-button.tsx";
import { useInterval } from "~/ui/hooks/use-interval.tsx";
import { auth } from "~/storage/auth.server.tsx";
import { getSubscriptionByCustomerId } from "~/models/subscription.server.ts";
import { PlanId } from "~/services/stripe/plans.ts";

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const subscription = await getSubscriptionByCustomerId(user.id);

  // User is already subscribed.
  if (subscription?.productId !== PlanId.FREE) return redirect("/account");

  return json({
    pending: subscription?.productId === PlanId.FREE,
    subscription,
  });
}

export default function Checkout() {
  const { pending, subscription } = useLoaderData<typeof loader>();
  const [retries, setRetries] = useState(0);
  const submit = useSubmit();

  //Re-fetch subscription every 'x' seconds.
  useInterval(
    () => {
      submit(null);
      setRetries(retries + 1);
    },
    pending && retries !== 3 ? 2_000 : null
  );

  return (
    <div className="m-auto flex min-h-[70%] max-w-md flex-col items-center justify-center px-6">
      {/* Pending Message. */}
      {pending && retries < 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Thank you for subscribing!</CardTitle>
            <CardDescription>Completing your checkout...</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <Loader className="inline-flex animate-spin" /> This will take a few
            seconds.
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      )}

      {/* Success Message. */}
      {!pending && (
        <Card>
          <CardHeader>
            <CardTitle>Checkout completed!</CardTitle>
            <CardDescription>Enjoy your new subscription plan!</CardDescription>
          </CardHeader>
          <CardContent>
            You are now subscribed to the{" "}
            <strong>{subscription && subscription.productId}</strong> plan.
          </CardContent>
          <CardFooter>
            <LinkButton to="/account" prefetch="intent" className="w-full">
              Continue to Account
            </LinkButton>
          </CardFooter>
        </Card>
      )}

      {/* Error Message. */}
      {pending && retries === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              An error occured during the subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            Something went wrong. Please contact us directly and we will solve
            it for you.
          </CardContent>
          <CardFooter>
            <LinkButton to="/account" prefetch="intent" className="w-full">
              Continue to Account
            </LinkButton>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
