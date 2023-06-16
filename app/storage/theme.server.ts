import { createCookieSessionStorage } from "@remix-run/node";

import { env } from "~/env.server.ts";
import { isTheme, Theme } from "../ui/components/theme-provider.tsx";

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "my_remix_theme",
    sameSite: "lax",
    path: "/",
    secrets: [env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : Theme.DARK;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}

export { getThemeSession };
