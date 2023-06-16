import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Hero } from "~/ui/components/frontend/hero.tsx";
import { SiteDescription } from "~/ui/components/frontend/site-description.tsx";
import { prisma } from "~/storage/db.server.ts";
import { auth } from "~/storage/public-auth.server.tsx";
import { getSiteSettings } from "~/models/settings.server.ts";

export async function loader({ request }: LoaderArgs) {
  const [user, posts, settings] = await Promise.all([
    auth.isAuthenticated(request),
    prisma.post.findMany(),
    getSiteSettings(),
  ]);

  return json({
    user,
    settings,
    posts,
  });
}

export default function Index() {
  const { settings } = useLoaderData<typeof loader>();
  return (
    <main className="relative flex min-h-screen flex-col gap-6">
      <Hero
        title={`${settings.title}!`}
        description={settings.description || ""}
        showForm={true}
      />
      <SiteDescription settings={settings} titleElement="div" />
    </main>
  );
}
