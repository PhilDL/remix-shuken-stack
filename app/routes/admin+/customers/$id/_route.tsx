import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { errorMessagesForSchema, inputFromForm } from "domain-functions";
import invariant from "tiny-invariant";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { SaveButton } from "~/ui/components/save-button.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import {
  addFlashMessage,
  redirectWithFlashMessage,
  wrapDomainErrorJSON,
} from "~/storage/flash-message.server.ts";
import { getCustomerById } from "~/models/customer.server.ts";
import { getSubscriptionByCustomerId } from "~/models/subscription.server.ts";
import {
  inputCustomerCreateSchema,
  updateCustomerAction,
} from "../customer-domain.server.ts";
import { CustomerForm } from "../customer-form.tsx";

export async function loader({ request, params }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  invariant(params.id, "Id is required");
  const [customer, subscriptions] = await Promise.all([
    getCustomerById(params.id),
    getSubscriptionByCustomerId(params.id),
  ]);
  invariant(customer, "Customer not found");
  return json({ customer, subscriptions });
}

export async function action({ request, params }: ActionArgs) {
  const requiredUser = await auth.isAuthenticated(request);

  const updateOperation = await updateCustomerAction(
    await inputFromForm(request),
    {
      user: requiredUser,
      id: params.id,
    }
  );
  if (!updateOperation.success) {
    console.log("updateOperation", updateOperation);
    return wrapDomainErrorJSON(updateOperation, request);
  }
  const flash = await addFlashMessage(request, {
    type: "success",
    title: "Saved",
    message: "Customer saved successfully",
  });
  return redirectWithFlashMessage(
    `/admin/customers/${updateOperation.data.id}`,
    flash
  );
}

export default function EditCustomer() {
  const { customer } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const errors = errorMessagesForSchema(
    data?.inputErrors ?? [],
    inputCustomerCreateSchema
  );

  return (
    <PageContainer>
      <PageHeader
        title={customer.name}
        subTitle="Edit customer info"
        actions={
          <SaveButton
            type="submit"
            variant={"default"}
            form="editCustomer"
            navigationState={navigation.state}
          >
            Save
          </SaveButton>
        }
      />
      <CustomerForm
        formId="editCustomer"
        errors={errors}
        name={customer.name || ""}
        email={customer.email || ""}
        note={customer.note || ""}
      />
    </PageContainer>
  );
}
