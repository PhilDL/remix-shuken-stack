import { useEffect, useState } from "react";
import { useLoaderData, useNavigation } from "@remix-run/react";
import type {
  DataFunctionArgs,
  TypedResponse,
} from "@remix-run/server-runtime";

import { Button } from "~/ui/components/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/components/dialog.tsx";
import { Label } from "~/ui/components/label.tsx";

export type LoaderWithMedias = ({
  request,
  params,
}: DataFunctionArgs) => Promise<
  TypedResponse<{ medias: { id: string; url: string }[] }>
>;
export const useMediaLibrary = <T extends LoaderWithMedias>(
  formId: string,
  options?: {
    fieldName: string;
  }
) => {
  const { medias } = useLoaderData<T>();
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const transition = useNavigation();

  useEffect(() => {
    if (transition.state === "submitting") {
      setMediaLibraryOpen(false);
    }
  }, [transition.state]);

  const MediaLibrary = () => (
    <Dialog onOpenChange={setMediaLibraryOpen} open={mediaLibraryOpen}>
      <DialogTrigger className="text-xs text-cornflower-500">
        Add from Library
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add from Library</DialogTitle>
          <DialogDescription asChild>
            <div>
              <p>Choose an image from your previously uploaded files</p>
              <div className="mt-8 grid grid-cols-4">
                {medias?.map((media) => (
                  <div key={media.id} className="flex items-center">
                    <input
                      type="radio"
                      name={options?.fieldName ?? "imageFromLibrary"}
                      value={media.url}
                      id={media.id}
                      form={formId}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={media.id}
                      className="mb-2 h-24 w-24 rounded-md border-2 border-input peer-focus:ring-2 peer-focus:ring-cornflower "
                    >
                      <img
                        src={media.url}
                        alt={media.id}
                        className="h-full w-full rounded-md object-cover"
                      />
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" form={formId} variant="default" size="sm">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    MediaLibrary,
    mediaLibraryOpen,
    setMediaLibraryOpen,
  };
};
