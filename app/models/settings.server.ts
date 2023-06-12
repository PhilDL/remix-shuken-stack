import type { Settings } from "@prisma/client";
import invariant from "tiny-invariant";

import { prisma } from "~/storage/db.server.ts";

export async function createDefaultSiteSettings(): Promise<Settings> {
  const settings = await prisma.settings.create({
    data: {
      title: "Shuken App",
    },
  });
  return settings;
}

export async function getSiteSettings(): Promise<Settings> {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    throw new Error("Site settings not found");
  }
  return settings;
}

export async function updateSiteSettings(
  data: Partial<Settings>
): Promise<Settings> {
  const currentSettings = await getSiteSettings();
  invariant(currentSettings, "Site settings not found");
  const settings = await prisma.settings.update({
    where: { id: currentSettings.id },
    data,
  });
  return settings;
}
