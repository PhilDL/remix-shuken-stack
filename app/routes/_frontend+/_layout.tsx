import { useEffect } from "react";
import { json, type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  AuthenticityTokenProvider,
  createAuthenticityToken,
} from "remix-utils";
import type { WebSite } from "schema-dts";

import { Footer } from "~/ui/components/frontend/footer.tsx";
import { Navbar } from "~/ui/components/frontend/navbar.tsx";
import { ToastAction } from "~/ui/components/toast.tsx";
import { useToast } from "~/ui/hooks/use-toast.tsx";
import {
  commitFlashMessageSession,
  getFlashMessageSession,
  type ToastMessage,
} from "~/storage/flash-message.server.ts";
import { auth } from "~/storage/public-auth.server.tsx";
import { sessionStorage } from "~/storage/session.server.ts";
import { getSiteSettings } from "~/models/settings.server.ts";

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [];
  }
  const settings = data.settings;
  const WebsitechemaLDJSON: WebSite = {
    "@type": "WebSite",
    publisher: {
      "@type": "Organization",
      name: settings.title,
      url: settings.url || "",
      logo: {
        "@type": "ImageObject",
        url: settings.logo || "",
      },
    },
    url: settings.url || "",
    mainEntityOfPage: settings.url || "",
    description: settings.description || "",
  };
  return [
    { charset: "utf-8" },
    { title: settings.title },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    {
      name: "description",
      content: settings.metaDescription || settings.description,
    },
    {
      tagName: "link",
      rel: "canonical",
      href: settings.url || "",
    },
    { property: "og:site_name", content: settings.title },
    { property: "og:type", content: "website" },
    { property: "og:title", content: settings.ogTitle || settings.title },
    {
      property: "og:description",
      content: settings.ogDescription || settings.description,
    },
    { property: "og:url", content: settings.url },
    {
      property: "og:image",
      content: settings.ogImage || settings.logo,
    },
    {
      name: "article:publisher",
      content: settings.facebook || settings.twitter,
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: settings.twitterTitle || settings.title,
    },
    {
      name: "twitter:description",
      content: settings.twitterDescription || settings.description,
    },
    { name: "twitter:url", content: settings.url },
    {
      name: "twitter:image",
      content: settings.twitterImage || settings.ogImage || settings.logo,
    },
    { name: "twitter:site", content: settings.twitter },
    { property: "og:image:width", content: "486" },
    { property: "og:image:height", content: "269" },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        ...WebsitechemaLDJSON,
      },
    },
  ];
};

export async function loader({ request }: LoaderArgs) {
  const [user, settings] = await Promise.all([
    auth.isAuthenticated(request),
    getSiteSettings(),
  ]);
  const toastSession = await getFlashMessageSession(
    request.headers.get("cookie")
  );
  const toastMessage = toastSession.get("toastMessage") as ToastMessage;
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));
  let csrf = createAuthenticityToken(session);

  const headers = new Headers();
  headers.append("Set-Cookie", await sessionStorage.commitSession(session));

  if (!toastMessage) {
    return json(
      {
        settings,
        user,
        toastMessage: null,
        magicLinkSent: session.has("auth:otp"),
        magicLinkEmail: session.get("auth:email"),
        csrf,
      },
      {
        headers,
      }
    );
  }
  headers.append("Set-Cookie", await commitFlashMessageSession(toastSession));
  return json(
    {
      settings,
      user,
      toastMessage,
      magicLinkSent: session.has("auth:otp"),
      magicLinkEmail: session.get("auth:email"),
      csrf,
    },
    {
      headers,
    }
  );
}

export default function FrontendLayout() {
  const { settings, csrf, user, toastMessage } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  useEffect(() => {
    if (toastMessage?.type === "error") {
      toast({
        variant: "destructive",
        title: toastMessage.title ?? "Uh oh! Something went wrong.",
        description: toastMessage.message,
        action: toastMessage.actionText ? (
          <ToastAction altText={toastMessage.actionText} asChild>
            <Link to={toastMessage.actionUrl || ""}>
              {toastMessage.actionText}
            </Link>
          </ToastAction>
        ) : undefined,
      });
    }
    if (toastMessage?.type === "success") {
      toast({
        title: toastMessage.title ?? "Operation Ok.",
        description: toastMessage.message ?? "Record saved successfully.",
        action: toastMessage.actionText ? (
          <ToastAction altText={toastMessage.actionText} asChild>
            <Link to={toastMessage.actionUrl || ""}>
              {toastMessage.actionText}
            </Link>
          </ToastAction>
        ) : undefined,
      });
    }
  }, [toast, toastMessage]);

  return (
    <AuthenticityTokenProvider token={csrf}>
      <div className="h-full min-h-full bg-white px-4 lg:container dark:bg-slate-950 lg:mx-auto lg:max-w-7xl">
        <Navbar settings={settings} user={user} />
        <Outlet />
        <Footer settings={settings} />
      </div>
    </AuthenticityTokenProvider>
  );
}
