import type { Settings } from "@prisma/client";
import { makeDomainFunction } from "domain-functions";
import * as z from "zod";

import { updateSiteSettings } from "~/models/settings.server.ts";
import { withFileInput } from "~/domain/admin/helpers.server.ts";

type UpdateSettings = Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>;

export const inputSettingsSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  logoFromLibrary: z.string().optional().nullable(),
  logoDelete: z.coerce.boolean().optional().default(false),
});

export const updateSettingsAction = makeDomainFunction(
  inputSettingsSchema,
  z.object({
    id: z.string(),
  })
)(async ({ logo, logoFromLibrary, logoDelete, ...rest }, { id }) => {
  // perform check on user role
  let data = withFileInput<UpdateSettings>(
    {
      ...rest,
    },
    { image: logo, imageFromLibrary: logoFromLibrary, imageDelete: logoDelete },
    "logo"
  );
  const settings = await updateSiteSettings(data);
  return settings;
});
