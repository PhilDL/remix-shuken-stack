import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    MAGIC_LINK_SECRET: z.string().min(1),
    SESSION_SECRET: z.string().min(1),
    ADMIN_SESSION_SECRET: z.string().min(1),
    SEED_ADMIN_EMAIL: z.string().min(1),
    SEED_ADMIN_PASSWORD: z.string().min(1),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1),
    S3_BUCKET_REGION: z.string().min(1),
    STRIPE_PUBLIC_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SIGNATURE: z.string().min(1),
    SENDGRID_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    APP_URL: z.string().min(1),
    NODE_ENV: z.enum(["development", "test", "production"]),
  },
  client: {
    PUBLIC_NODE_ENV: z.enum(["development", "test", "production"]),
  },
  runtimeEnv: { ...process.env, PUBLIC_NODE_ENV: process.env.NODE_ENV },
});
