import { Readable } from "stream";
import { S3Client, type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  type UploadHandler,
} from "@remix-run/node";
import cuid from "cuid";

import { env } from "~/env.server.ts";

export const createS3UploadHandler = ({
  inputNames,
  acceptedContentTypes,
  userId,
  uploadedCallback,
}: {
  inputNames: string[];
  acceptedContentTypes: string[];
  userId?: string;
  uploadedCallback?: (data: {
    url: string;
    filename: string;
    key: string;
    type: string;
    storage: string;
    authorId: string;
    bucket?: string;
  }) => Promise<void>;
}): UploadHandler => {
  const s3Client = new S3Client({
    region: env.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
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
      const key = `${cuid()}-${filename}`;

      const params: PutObjectCommandInput = {
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: Readable.from(data),
        ContentType: contentType,
        Metadata: {
          filename: filename,
        },
      };

      try {
        const upload = new Upload({ client: s3Client, params });
        upload.on("httpUploadProgress", (progress: any) => {
          console.log({ progress });
        });
        const uploadDone = await upload.done();
        if (typeof uploadDone == "object" && "Location" in uploadDone) {
          if (uploadedCallback && userId) {
            await uploadedCallback({
              url: uploadDone.Location || "",
              filename,
              key,
              type: contentType,
              storage: "s3",
              bucket: env.S3_BUCKET_NAME,
              authorId: userId,
            });
          }
          return uploadDone.Location;
        } else {
          console.log("Couldnt upload file to S3");
          return undefined;
        }
      } catch (err) {
        console.error(err);
        return undefined;
      }
    },
    // fallback to memory for everything else
    createMemoryUploadHandler()
  );
};
