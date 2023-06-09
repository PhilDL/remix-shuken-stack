import { type ActionArgs, type LoaderArgs } from "@remix-run/node";

import { auth } from "~/storage/public-auth.server.tsx";

export async function loader({ request }: LoaderArgs) {
  await auth.logout(request, { redirectTo: "/" });
}

export async function action({ request }: ActionArgs) {
  await auth.logout(request, { redirectTo: "/" });
}
