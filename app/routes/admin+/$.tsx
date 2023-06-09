import { NotFound } from "~/ui/components/admin/not-found.tsx";
import { PageContainer } from "~/ui/components/admin/page-container.tsx";

export default function Admin404() {
  return (
    <PageContainer className="justify-center">
      <NotFound />
    </PageContainer>
  );
}
