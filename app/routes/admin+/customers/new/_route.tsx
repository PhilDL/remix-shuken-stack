import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useActionData, useNavigation } from "@remix-run/react";
import { errorMessagesForSchema, inputFromForm } from "domain-functions";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { SaveButton } from "~/ui/components/save-button.tsx";
import { auth } from "~/storage/auth.server.ts";
import {
  addFlashMessage,
  redirectWithFlashMessage,
  wrapDomainErrorJSON,
} from "~/storage/flash-message.server.ts";
import {
  createNewCustomer,
  inputCustomerCreateSchema,
} from "../customer-domain.server.ts";
import { CustomerForm } from "../customer-form.tsx";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  return json({ markdownContent: "# My title" });
}

export async function action({ request }: ActionArgs) {
  const requiredUser = await auth.isAuthenticated(request);

  const createOperation = await createNewCustomer(
    await inputFromForm(request),
    requiredUser
  );
  if (!createOperation.success) {
    console.log("createOperation", createOperation);
    return wrapDomainErrorJSON(createOperation, request);
  }
  const flash = await addFlashMessage(request, {
    type: "success",
    title: "Saved",
    message: "Custmer created successfully",
  });
  return redirectWithFlashMessage(
    `/admin/customers/${createOperation.data.id}`,
    flash
  );
}
export default function NewCustomer() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const errors = errorMessagesForSchema(
    data?.inputErrors ?? [],
    inputCustomerCreateSchema
  );

  return (
    <PageContainer>
      <PageHeader
        title="Customer"
        subTitle="Create a new customer"
        actions={
          <SaveButton
            type="submit"
            variant={"default"}
            form="newCustomer"
            navigationState={navigation.state}
          >
            Save
          </SaveButton>
        }
      />
      <CustomerForm formId="newCustomer" errors={errors} />
    </PageContainer>
  );
}
