import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { User2Icon } from "lucide-react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
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
import { getAllCustomers } from "~/models/customer.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const customers = await getAllCustomers();
  return json({ customers });
}

export default function CustomersIndex() {
  const { customers } = useLoaderData<typeof loader>();
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
