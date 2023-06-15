import type { ActionArgs } from "@remix-run/node";
import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { inputFromForm } from "domain-functions";
import { DollarSign, MoreHorizontal } from "lucide-react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { ProductPrice } from "~/ui/components/admin/product-price.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/ui/components/alert-dialog.tsx";
import { Button } from "~/ui/components/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/ui/components/dropdown-menu.tsx";
import { LinkButton } from "~/ui/components/link-button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/components/table.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import { wrapDomainErrorJSON } from "~/storage/flash-message.server.ts";
import { getAllProducts } from "~/models/product.server.ts";
import type { Interval } from "~/services/stripe/plans.ts";
import { deleteProductAction } from "../delete-product.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const plans = await getAllProducts({
    prices: {
      where: {
        active: true,
      },
    },
  });
  return json({ plans });
}

export async function action({ request }: ActionArgs) {
  const deleteOperation = await deleteProductAction(
    await inputFromForm(request),
    await auth.isAuthenticated(request, {
      failureRedirect: "/admin/login",
    })
  );
  if (!deleteOperation.success) {
    console.warn("deleteOperation", deleteOperation);
    return wrapDomainErrorJSON(deleteOperation, request);
  }
  return redirect("/admin/plans");
}

export default function PlansIndex() {
  const { plans } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  return (
    <PageContainer>
      <PageHeader
        title="Plans"
        subTitle="These are your plans"
        actions={
          <LinkButton to="/admin/plans/new" variant={"outline"}>
            New Article
          </LinkButton>
        }
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Prices</TableHead>
              <TableHead> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableEmptyState
                to="/admin/plans/new"
                LucideIcon={DollarSign}
                message="Create a new Subscription Plan"
              />
            ) : (
              <>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-semibold dark:text-slate-50">
                      {plan.name}
                    </TableCell>
                    <TableCell>
                      {plan.description || (
                        <em className="text-muted-foreground">
                          No description
                        </em>
                      )}
                    </TableCell>
                    <TableCell className="flex flex-col gap-2">
                      {plan.prices.map((p) => (
                        <ProductPrice
                          key={p.id}
                          type={p.type as "one_time" | "recurring"}
                          amount={p.amount}
                          currency={p.currency}
                          interval={p.interval as Interval}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/plans/${plan.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                              Delete
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete this plan and all related
                                  subscriptions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                <AlertDialogAction asChild>
                                  <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      fetcher.submit(
                                        {
                                          action: "delete",
                                          productId: plan.id,
                                        },
                                        { method: "post" }
                                      )
                                    }
                                  >
                                    Delete
                                  </Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
