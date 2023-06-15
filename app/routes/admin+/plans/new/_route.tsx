import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useActionData, useNavigation } from "@remix-run/react";
import { errorMessagesForSchema, inputFromForm } from "domain-functions";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { SaveButton } from "~/ui/components/save-button.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import {
  addFlashMessage,
  redirectWithFlashMessage,
  wrapDomainErrorJSON,
} from "~/storage/flash-message.server.ts";
import { createNewPlan, planInvariants } from "../create-product.server.ts";
import { ProductForm } from "../product-form.tsx";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  return json({ markdownContent: "# My title" });
}

export async function action({ request }: ActionArgs) {
  const requiredUser = await auth.isAuthenticated(request);

  const createOperation = await createNewPlan(
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
    message: "Plan created successfully",
  });
  return redirectWithFlashMessage(
    `/admin/plans/${createOperation.data.id}`,
    flash
  );
}
export default function NewPlan() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const errors = errorMessagesForSchema(
    data?.inputErrors ?? [],
    planInvariants
  );

  return (
    <PageContainer>
      <PageHeader
        title="Plan"
        subTitle="Create a new Subscription plan with Monthly Or/And Yearly intervals"
        actions={
          <SaveButton
            type="submit"
            variant={"default"}
            form="newProduct"
            navigationState={navigation.state}
          >
            Save
          </SaveButton>
        }
      />
      <ProductForm formId="newProduct" errors={errors} />
    </PageContainer>
  );
}
