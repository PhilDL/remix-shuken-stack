import { z } from "zod";

export const metaDataSchemas = z.object({
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDesc: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  twitterTitle: z.string().optional().nullable(),
  twitterDesc: z.string().optional().nullable(),
  twitterImage: z.string().optional().nullable(),
});

export const identitySchema = z.object({
  id: z.string(),
  slug: z.string(),
});

export const requiredUser = z.object({
  id: z.string(),
});
