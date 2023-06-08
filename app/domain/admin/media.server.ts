import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { makeDomainFunction } from "domain-functions";
import invariant from "tiny-invariant";
import * as z from "zod";

import { checkIsRecordAuthor } from "~/models/helpers.server.ts";
import { env } from "~/env.ts";
import { deleteMedia, getMedia } from "../../models/medias.server.ts";
import { requiredUser } from "./schemas.ts";

const inputDeleteCourse = z.object({
  mediaId: z.string(),
  action: z.literal("delete"),
});
export const deleteMediaAction = makeDomainFunction(
  inputDeleteCourse,
  requiredUser
)(async ({ mediaId, action }, user) => {
  const userIsMediaOwner = await checkIsRecordAuthor(user.id, mediaId, "media");
  if (!userIsMediaOwner) {
    throw new Error("You are not the owner of this Media");
  }
  if (action !== "delete") {
    throw new Error("You must confirm the action");
  }
  const media = await getMedia(mediaId);
  invariant(media, "Media not found");

  const s3Client = new S3Client({
    region: env.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: media.key || undefined,
  });

  const response = await s3Client.send(command);
  console.log("S3 Delete response", response);

  const updatedCourse = await deleteMedia(media.id);
  return updatedCourse;
});
