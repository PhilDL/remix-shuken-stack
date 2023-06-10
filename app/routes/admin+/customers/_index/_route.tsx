import type { ActionArgs } from "@remix-run/node";
import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { inputFromForm } from "domain-functions";
import { User2Icon } from "lucide-react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
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
import { LinkButton } from "~/ui/components/link-button.tsx";
import { NavLinkButton } from "~/ui/components/navlink-button.tsx";
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
import { getAllCustomers } from "~/models/customer.server.ts";
import { deleteCustomerAction } from "../customer-domain.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const customers = await getAllCustomers();
  return json({ customers });
}

export async function action({ request }: ActionArgs) {
  const deleteOperation = await deleteCustomerAction(
    await inputFromForm(request),
    await auth.isAuthenticated(request, {
      failureRedirect: "/admin/login",
    })
  );
  if (!deleteOperation.success) {
    return wrapDomainErrorJSON(deleteOperation, request);
  }
  return redirect("/admin/customers");
}

export default function CustomersIndex() {
  const { customers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  return (
    <PageContainer>
      <PageHeader
        title="Customers"
        subTitle="These are your customers"
        actions={
          <LinkButton to="/admin/customers/new" variant={"outline"}>
            New Article
          </LinkButton>
        }
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Subscription</TableHead>
              <TableCell className="relative py-3.5 pl-3 pr-6">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableEmptyState
                to="/admin/customers/new"
                LucideIcon={User2Icon}
                message="Create a Customer"
              />
            ) : (
              <>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-semibold dark:text-slate-50">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.note}</TableCell>
                    <TableCell>
                      {customer.subscribed ? "Subscribed" : "None"}
                    </TableCell>
                    <TableCell>
                      <NavLinkButton
                        to={`/admin/customers/${customer.id}`}
                        variant={"link"}
                      >
                        Edit
                      </NavLinkButton>
                      <AlertDialog>
                        <AlertDialogTrigger className="text-red-700 dark:text-red-300">
                          Delete
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this customer and all related
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
                                      customerId: customer.id,
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
