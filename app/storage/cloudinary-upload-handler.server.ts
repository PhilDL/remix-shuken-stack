import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  writeAsyncIterableToWritable,
  type UploadHandler,
} from "@remix-run/node";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(data: AsyncIterable<Uint8Array>) {
  const uploadPromise = new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "shuken",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
    await writeAsyncIterableToWritable(data, uploadStream);
  });

  return uploadPromise;
}

export const createCloudinaryUploadHandler = ({
  inputNames,
  acceptedContentTypes,
}: {
  inputNames: string[];
  acceptedContentTypes: string[];
}): UploadHandler => {
  return composeUploadHandlers(
    // our custom upload handler
    async ({ name, contentType, data, filename }) => {
      if (!inputNames.includes(name)) {
        return undefined;
      }
      if (!filename) {
        return undefined;
      }
      if (!acceptedContentTypes.includes(contentType)) {
        return undefined;
      }
      const uploadedImage = await uploadImage(data);
      if (uploadedImage) {
        return (uploadedImage as { secure_url: string }).secure_url;
      }
      return undefined;
    },
    // fallback to memory for everything else
    createMemoryUploadHandler()
  );
};
