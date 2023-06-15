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
import { getProductById } from "~/models/product.server.ts";
import { ProductForm } from "../plan-form.tsx";
import { planInvariants, updatePlan } from "../update-plan.server.ts";

export async function loader({ request, params }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  invariant(params.id, "Id is required");
  const product = await getProductById(params.id, {
    prices: {
      where: {
        active: true,
      },
    },
  });
  invariant(product, "Product not found");
  return json({ product });
}

export async function action({ request, params }: ActionArgs) {
  const requiredUser = await auth.isAuthenticated(request);

  const updateOperation = await updatePlan(await inputFromForm(request), {
    user: requiredUser,
    productId: params.id,
  });
  if (!updateOperation.success) {
    console.log("updateOperation", updateOperation);
    return wrapDomainErrorJSON(updateOperation, request);
  }
  const flash = await addFlashMessage(request, {
    type: "success",
    title: "Saved",
    message: "Plan saved successfully",
  });
  return redirectWithFlashMessage(
    `/admin/plans/${updateOperation.data.id}`,
    flash
  );
}

export default function EditPlan() {
  const { product } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const errors = errorMessagesForSchema(
    data?.inputErrors ?? [],
    planInvariants
  );
  const monthlyPrice = product.prices.find(
    (price) => price.interval === "month"
  );
  const yearlyPrice = product.prices.find((price) => price.interval === "year");

  return (
    <PageContainer>
      <PageHeader
        title={product.name}
        subTitle={
          <>
            Edit your subscription plan, change the name, description, Yearly
            and Monthly price. <br />
            Theses changes will be reflected in Stripe.
          </>
        }
        actions={
          <SaveButton
            type="submit"
            variant={"default"}
            form="editProduct"
            navigationState={navigation.state}
          >
            Save
          </SaveButton>
        }
      />
      <ProductForm
        formId="editProduct"
        errors={errors}
        name={product.name}
        description={product.description || ""}
        monthly={monthlyPrice?.active}
        monthlyPrice={(monthlyPrice?.amount ?? 0) / 100}
        yearly={yearlyPrice?.active}
        yearlyPrice={(yearlyPrice?.amount ?? 0) / 100}
      />
    </PageContainer>
  );
}
