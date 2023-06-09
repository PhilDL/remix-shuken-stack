import { redirect, type ActionArgs } from "@remix-run/node";
import { inputFromForm } from "domain-functions";

import { auth } from "~/storage/admin-auth.server.ts";
import { wrapDomainErrorJSON } from "~/storage/flash-message.server.ts";
import { deleteMediaAction } from "~/domain/admin/media.server.ts";

export async function action({ request }: ActionArgs) {
  const deleteOperation = await deleteMediaAction(
    await inputFromForm(request),
    await auth.isAuthenticated(request, {
      failureRedirect: "/admin/login",
    })
  );
  if (!deleteOperation.success) {
    console.log("deleteOperation", deleteOperation);
    return wrapDomainErrorJSON(deleteOperation, request);
  }
  return redirect("/admin/medias");
}
