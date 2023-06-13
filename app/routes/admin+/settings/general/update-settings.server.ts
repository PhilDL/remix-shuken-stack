import { makeDomainFunction } from "domain-functions";
import * as z from "zod";

import { parseImageIntent } from "~/storage/parse-image-intent.ts";
import { updateSiteSettings } from "~/models/settings.server.ts";

export const inputSettingsSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  logoFromLibrary: z.string().optional().nullable(),
  logoDelete: z.coerce.boolean().optional().default(false),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  street2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

export const updateSettingsAction = makeDomainFunction(
  inputSettingsSchema,
  z.object({
    id: z.string(),
  })
)(async ({ logo, logoFromLibrary, logoDelete, ...rest }, { id }) => {
  let data = {
    ...rest,
    ...parseImageIntent("logo", {
      image: logo,
      imageFromLibrary: logoFromLibrary,
      imageDelete: logoDelete,
    }),
  };
  const settings = await updateSiteSettings(data);
  return settings;
});
