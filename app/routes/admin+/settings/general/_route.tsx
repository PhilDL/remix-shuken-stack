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
    <div>
      <Form
        className="mt-16 flex flex-col justify-start gap-16 lg:flex-row"
        method="post"
        id="settings"
        encType="multipart/form-data"
      >
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
          <SaveButton navigationState={navigation.state}>Save</SaveButton>
        </div>
      </Form>
    </div>
  );
}
