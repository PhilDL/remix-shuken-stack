import type { Media } from "@prisma/client";

import { prisma } from "~/storage/db.server.ts";

export type { Media } from "@prisma/client";

export async function getAllMedias() {
  return prisma.media.findMany();
}

export type SaveMedia = {
  filename: string;
  url: string;
  key: string;
  type: string;
  storage: string;
  authorId: string;
  bucket?: string;
};

export async function saveMedia(media: SaveMedia) {
  await prisma.media.upsert({
    where: {
      url: media.url,
    },
    update: media,
    create: media,
  });
}

export async function getMedia(id: Media["id"]) {
  return prisma.media.findUnique({
    where: {
      id,
    },
  });
}

export async function deleteMedia(id: Media["id"]) {
  return prisma.media.delete({
    where: {
      id,
    },
  });
}
