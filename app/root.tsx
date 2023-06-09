import {
  json,
  type LinksFunction,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { clsx } from "clsx";
import { ClientOnly, StructuredData } from "remix-utils";

import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from "~/ui/components/theme-provider.tsx";
import { Toaster } from "~/ui/components/toaster.tsx";
import { app } from "~/settings.ts";
import { getEnv } from "./env.server.ts";
import { getUser } from "./storage/session.server.ts";
import { getThemeSession } from "./storage/theme.server.ts";
import fontStylesheet from "./styles/fonts.css";
import nordthemeStylesheet from "./styles/nordtheme.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { useNonce } from "./utils/nonce-provider.ts";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: fontStylesheet },
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: nordthemeStylesheet },
  ];
};

export const meta: V2_MetaFunction = () => [
  { charset: "utf-8" },
  { title: `${app.title} - ${app.description}` },
  { viewport: "width=device-width,initial-scale=1" },
];

export async function loader({ request }: LoaderArgs) {
  const themeSession = await getThemeSession(request);
  return json({
    user: await getUser(request),
    theme: themeSession.getTheme(),
    ENV: getEnv(),
  });
}

function App() {
  const data = useLoaderData<typeof loader>();
  // const nonce = useNonce();
  const [theme] = useTheme();
  return (
    <html lang="en" className={clsx("h-full", theme)}>
      <head>
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
        <StructuredData />
      </head>
      <body className="h-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ClientOnly>{() => <Toaster />}</ClientOnly>
        <LiveReload />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  );
}
