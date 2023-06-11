import type { ActionArgs } from "@remix-run/node";
import { json, type LoaderArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { errorMessagesForSchema, inputFromForm } from "domain-functions";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/components/card.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { SaveButton } from "~/ui/components/save-button.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import {
  addFlashMessage,
  redirectWithFlashMessage,
  wrapDomainErrorJSON,
} from "~/storage/flash-message.server.ts";
import {
  changePassword,
  inputChangePasswordSchema,
} from "./change-password.server.ts";

export async function loader({ request }: LoaderArgs) {
  return json({});
}

export async function action({ request }: ActionArgs) {
  const requiredUser = await auth.isAuthenticated(request);

  const changePasswordAction = await changePassword(
    await inputFromForm(request),
    requiredUser
  );
  if (!changePasswordAction.success) {
    console.log("changePasswordAction", changePasswordAction);
    return wrapDomainErrorJSON(changePasswordAction, request);
  }
  console.log("changePasswordAction", changePasswordAction.data);
  const flash = await addFlashMessage(request, {
    type: "success",
    title: "Saved",
    message: "Password changed successfully",
  });
  return redirectWithFlashMessage(`/admin/settings/profile`, flash);
}

export default function SettingsProfile() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const errors = errorMessagesForSchema(
    data?.inputErrors ?? [],
    inputChangePasswordSchema
  );
  return (
    <Form method="post" id="resetPassword">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Here you can change your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 lg:basis-96">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="oldPassword">Old password</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                autoComplete="current-password"
                defaultValue={""}
                required={true}
              />
              {errors && errors.oldPassword && (
                <p className="text-sm text-red-600">{errors.oldPassword}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                defaultValue={""}
                required={true}
              />
              {errors && errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                type="password"
                defaultValue={""}
                required={true}
              />
              {errors && errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SaveButton navigationState={navigation.state} type="submit">
            Confirm
          </SaveButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
