import { startTransition } from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";

import { env } from "./env.ts";

if (env.PUBLIC_NODE_ENV === "development") {
  console.log("env", env);
  import("~/utils/devtools.tsx").then(({ init }) => init());
}
startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
