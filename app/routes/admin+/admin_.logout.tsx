import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { auth } from "~/storage/admin-auth.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.logout(request, { redirectTo: "/admin/login" });
}

export async function action({ request }: ActionArgs) {
  await auth.logout(request, { redirectTo: "/admin/login" });
}
