import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";

export async function loader({ request }: LoaderArgs) {
  return redirect("/admin/dashboard", 301);
}
