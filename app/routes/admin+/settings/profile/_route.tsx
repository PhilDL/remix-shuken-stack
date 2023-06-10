import { json, type LoaderArgs } from "@remix-run/node";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";

export async function loader({ request }: LoaderArgs) {
  return json({});
}

export default function Settings() {
  return (
    <PageContainer>
      <PageHeader title="Profile" subTitle="Profile settings" />
      <main className="container grid grid-cols-2 gap-3 py-8 xl:grid-cols-3">
        Profile
      </main>
    </PageContainer>
  );
}
