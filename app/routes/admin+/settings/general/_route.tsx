import type { ActionArgs } from "@remix-run/node";
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  type LoaderArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { errorMessagesForSchema, inputFromFormData } from "domain-functions";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/components/card.tsx";
import { FileInput } from "~/ui/components/file-input.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { SaveButton } from "~/ui/components/save-button.tsx";
import { Textarea } from "~/ui/components/textarea.tsx";
import { useMediaLibrary } from "~/ui/hooks/use-media-library.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import {
  addFlashMessage,
  redirectWithFlashMessage,
  wrapDomainErrorJSON,
} from "~/storage/flash-message.server.ts";
import { createS3UploadHandler } from "~/storage/s3-upload-handler.server.ts";
import { getAllMedias, saveMedia } from "~/models/medias.server.ts";
import { getSiteSettings } from "~/models/settings.server.ts";
import {
  inputSettingsSchema,
  updateSettingsAction,
} from "./update-settings.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const [settings, medias] = await Promise.all([
    getSiteSettings(),
    getAllMedias(),
  ]);
  return json({ settings, medias });
}

export async function action({ request, params }: ActionArgs) {
  const requiredUser = await auth.isAuthenticated(request);
  const uploadHandler = createS3UploadHandler({
    inputNames: ["logo"],
    acceptedContentTypes: [
      "image/gif",
      "image/jpeg",
      "image/pjpeg",
      "image/x-png",
      "image/png",
      "image/svg+xml",
    ],
    userId: requiredUser?.id,
    uploadedCallback: saveMedia,
  });
  const formData = await parseMultipartFormData(request, uploadHandler);

  const updateOperation = await updateSettingsAction(
    inputFromFormData(formData),
    requiredUser
  );
  if (!updateOperation.success) {
    console.log("updateOperation", updateOperation);
    return wrapDomainErrorJSON(updateOperation, request);
  }
  const flash = await addFlashMessage(request, {
    type: "success",
    title: "Saved",
    message: "Settings saved successfully",
  });
  return redirectWithFlashMessage(`/admin/settings/general`, flash);
}

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const { MediaLibrary } = useMediaLibrary<typeof loader>("settings", {
    fieldName: "logoFromLibrary",
  });
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const errors = errorMessagesForSchema(
    data?.inputErrors ?? [],
    inputSettingsSchema
  );

  return (
    <Form
      method="post"
      id="settings-general"
      encType="multipart/form-data"
      className="grid grid-cols-2 gap-8"
    >
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Global website settings</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-6">
          <div className="flex flex-col gap-6 lg:basis-96">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={settings.title || ""}
                required={true}
              />
              {errors && errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <div className="flex flex-row items-center justify-between">
                <Label htmlFor="image">Logo</Label>
                <MediaLibrary />
              </div>

              <FileInput
                key={settings.logo}
                inputName={"logo"}
                imageUrl={settings.logo ?? undefined}
                acceptedContentTypes={[
                  "image/gif",
                  "image/jpeg",
                  "image/pjpeg",
                  "image/x-png",
                  "image/png",
                  "image/svg+xml",
                ]}
                className="h-32 w-32"
              />
              {errors && errors.logo && (
                <p className="text-sm text-red-600">{errors.logo}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={settings.description || ""}
              />
              {errors && errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SaveButton navigationState={navigation.state}>Save</SaveButton>
        </CardFooter>
      </Card>
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Contact info</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-6">
          <div className="flex flex-col gap-6 lg:basis-96">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email || ""}
              />
              {errors && errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="phone"
                defaultValue={settings.phone || ""}
              />
              {errors && errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-6 lg:basis-96">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                name="street"
                defaultValue={settings.street || ""}
              />
              {errors && errors.street && (
                <p className="text-sm text-red-600">{errors.street}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="street2">Street2</Label>
              <Input
                id="street2"
                name="street2"
                defaultValue={settings.street2 || ""}
              />
              {errors && errors.street2 && (
                <p className="text-sm text-red-600">{errors.street2}</p>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-6 lg:basis-96">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={settings.city || ""} />
              {errors && errors.city && (
                <p className="text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="zip">Zip</Label>
              <Input id="zip" name="zip" defaultValue={settings.zip || ""} />
              {errors && errors.zip && (
                <p className="text-sm text-red-600">{errors.zip}</p>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-6 lg:basis-96">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={settings.country || ""}
              />
              {errors && errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SaveButton navigationState={navigation.state}>Save</SaveButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
