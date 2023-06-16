import { useEffect, useRef, useState } from "react";
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { CopyIcon, Trash } from "lucide-react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { AspectRatio } from "~/ui/components/aspect-ratio.tsx";
import { Badge } from "~/ui/components/badge.tsx";
import { Button } from "~/ui/components/button.tsx";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/ui/components/context-menu.tsx";
import {
  FileInput,
  type FileInputHandle,
} from "~/ui/components/file-input.tsx";
import { useCopyToClipboard } from "~/ui/hooks/use-copy-to-clipboard.tsx";
import { cn } from "~/ui/utils.ts";
import { auth } from "~/storage/auth.server.ts";
import { createS3UploadHandler } from "~/storage/s3-upload-handler.server.ts";
import { getAllMedias, saveMedia } from "~/models/medias.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const medias = await getAllMedias();
  return json({ medias });
}

export async function action({ request }: ActionArgs) {
  const requiredUser = await auth.isAuthenticated(request);
  const uploadHandler = createS3UploadHandler({
    inputNames: ["newFile"],
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
  await parseMultipartFormData(request, uploadHandler);
  return json({
    ok: true,
  });
}
export default function Medias() {
  const fetcher = useFetcher();
  const { medias } = useLoaderData<typeof loader>();
  const [newFile, setNewFile] = useState<File>();
  const fileInputRef = useRef<FileInputHandle>(null);
  const { copyToClipboard } = useCopyToClipboard();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      setNewFile(undefined);
      fileInputRef.current?.reset();
    }
  }, [fetcher]);

  const deleteMedia = (id: string) => {
    fetcher.submit(
      { mediaId: id, action: "delete" },
      {
        method: "post",
        action: `/admin/medias/delete`,
      }
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Medias"
        subTitle="Here you will find all the medias uploaded, IMG, PDF, etc."
      />
      <main className="mt-16 grid grid-cols-3 gap-4 xl:grid-cols-4">
        {medias.map((media) => (
          <ContextMenu key={media.id}>
            <ContextMenuTrigger
              asChild
              disabled={
                fetcher.submission?.formData.get("mediaId") === media.id
              }
            >
              <div
                className={cn(
                  "flex h-full w-full flex-col gap-3 rounded-md relative",
                  "border-1 border border-input p-2",
                  "hover:ring-1 hover:ring-ring"
                )}
              >
                <AspectRatio ratio={4 / 3}>
                  <img
                    src={media.url}
                    alt={media.url}
                    className="h-full w-full cursor-pointer rounded-md object-cover"
                  />
                </AspectRatio>
                <div className="flex flex-row items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {media.filename}
                  </span>
                  <Badge variant="outline">{media.storage}</Badge>
                </div>
                {fetcher.submission?.formData.get("mediaId") === media.id && (
                  <div className="absolute -ml-2 -mt-2 flex h-full w-full animate-pulse items-center justify-center rounded-md bg-black/10 text-white backdrop-blur-sm"></div>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-32">
              <ContextMenuItem
                onClick={(e) => {
                  copyToClipboard(media.url);
                }}
              >
                <CopyIcon className="mr-2 h-4 w-4" />
                Copy Url
              </ContextMenuItem>
              <ContextMenuItem
                onClick={(e) => {
                  deleteMedia(media.id);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        <fetcher.Form
          method="post"
          className="border-1 relative flex h-full min-h-[260px] w-full flex-col gap-3 rounded-md border border-input p-2"
          encType="multipart/form-data"
        >
          <FileInput
            imageUrl=""
            ref={fileInputRef}
            inputName="newFile"
            onChange={(data) => {
              setNewFile(data);
            }}
            acceptedContentTypes={[
              "image/gif",
              "image/jpeg",
              "image/pjpeg",
              "image/x-png",
              "image/png",
              "image/svg+xml",
            ]}
            className="flex-1"
            placeholder="PNG, JPG, GIF up to 10MB"
          />
          {fetcher.state === "submitting" &&
            fetcher.submission.formData.get("action") === "new" && (
              <div className="absolute -ml-2 -mt-2 flex h-full w-full animate-pulse items-center justify-center rounded-md bg-black/10 text-white backdrop-blur-sm"></div>
            )}
          <div className="flex h-5 flex-row items-center justify-between">
            <span className="text-xs font-bold text-foreground ">
              {newFile && newFile.name ? newFile.name : "Upload a new file"}
            </span>
            {newFile && newFile.name && (
              <Button
                variant={"link"}
                type="submit"
                name="action"
                value="new"
                disabled={
                  fetcher.state === "submitting" || fetcher.state === "loading"
                }
              >
                {fetcher.state === "submitting" || fetcher.state === "loading"
                  ? "Uploading"
                  : "Save"}
              </Button>
            )}
          </div>
        </fetcher.Form>
      </main>
    </PageContainer>
  );
}
