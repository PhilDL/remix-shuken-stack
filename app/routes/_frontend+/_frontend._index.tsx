import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Hero } from "~/ui/components/frontend/hero.tsx";
import { SiteDescription } from "~/ui/components/frontend/site-description.tsx";
import { auth } from "~/storage/auth.server.tsx";
import { prisma } from "~/storage/db.server.ts";
import { site } from "~/settings.ts";

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request);
  const posts = await prisma.post.findMany();

  return json({
    user,
    site,
    posts,
  });
}

export default function Index() {
  const { site } = useLoaderData<typeof loader>();
  return (
    <main className="relative flex min-h-screen flex-col gap-6">
      <Hero
        title={`Sign up to ${site.title}!`}
        description={site.description}
        showForm={true}
      />
      <SiteDescription settings={site} titleElement="div" />
    </main>
  );
}
