import type { Post, User } from "@prisma/client";

import { prisma } from "~/storage/db.server.ts";

export type { Post } from "@prisma/client";

export async function getPostBySlug(slug: Post["slug"]) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function getAllUserPosts(authorId: User["id"]) {
  return prisma.post.findMany({ where: { authorId } });
}

export type CreatePost = Pick<Post, "title" | "slug" | "content" | "authorId">;

export async function createPost(data: CreatePost) {
  return prisma.post.create({
    data,
  });
}

export async function updatePost(id: Post["id"], data: CreatePost) {
  return prisma.post.update({
    data,
    where: {
      id,
    },
  });
}

export async function deletePost(id: Post["id"]) {
  return prisma.post.delete({ where: { id } });
}
