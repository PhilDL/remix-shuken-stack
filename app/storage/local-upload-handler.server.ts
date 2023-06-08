import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from "@remix-run/node";

export const uploadHandler = composeUploadHandlers(
  createFileUploadHandler({
    directory: "public/uploads",
    maxPartSize: 30000,
  }),
  createMemoryUploadHandler()
);
