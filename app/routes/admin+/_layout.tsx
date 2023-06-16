import { useEffect } from "react";
import { json, type LoaderArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { clsx } from "clsx";
import {
  Book,
  DollarSign,
  Feather,
  Home,
  ImageIcon,
  Settings,
  Users,
} from "lucide-react";

import { DesktopAside } from "~/ui/components/admin/desktop-aside.tsx";
import { NavTop } from "~/ui/components/admin/nav-top.tsx";
import { useTheme } from "~/ui/components/theme-provider.tsx";
import { useToast } from "~/ui/hooks/use-toast.tsx";
import { auth, requireUser } from "~/storage/admin-auth.server.ts";
import {
  commitFlashMessageSession,
  getFlashMessageSession,
  type ToastMessage,
} from "~/storage/flash-message.server.ts";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    LucideIcon: Home,
    current: false,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    LucideIcon: Users,
    current: false,
  },
  {
    name: "Posts",
    href: "/admin/posts",
    LucideIcon: Feather,
    current: false,
  },
  {
    name: "Misc.",
    href: "/admin/misc",
    LucideIcon: Book,
    current: false,
    children: [{ name: "CSV Uploads", href: "/admin/csv-upload" }],
  },
  {
    name: "Plans",
    href: "/admin/plans",
    LucideIcon: DollarSign,
    current: false,
  },
  {
    name: "Medias",
    href: "/admin/medias",
    LucideIcon: ImageIcon,
    current: false,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    LucideIcon: Settings,
    current: false,
  },
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "/admin/settings" },
  { name: "Sign out", href: "/admin/logout" },
];

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const toastSession = await getFlashMessageSession(
    request.headers.get("cookie")
  );
  const toastMessage = toastSession.get("toastMessage") as ToastMessage;
  if (!toastMessage) {
    return json({
      user,
      toastMessage: null,
    });
  }
  if (!toastMessage.type) {
    throw new Error("Message should have a type");
  }
  return json(
    {
      user,
      toastMessage: toastMessage,
    },
    { headers: { "Set-Cookie": await commitFlashMessageSession(toastSession) } }
  );
}

export default function AdminLayout() {
  const { toastMessage, user } = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    if (toastMessage?.type === "error") {
      toast({
        variant: "destructive",
        title: toastMessage.title ?? "Uh oh! Something went wrong.",
        description: toastMessage.message,
      });
    }
    if (toastMessage?.type === "success") {
      toast({
        title: toastMessage.title ?? "Operation Ok.",
        description: toastMessage.message ?? "Record saved successfully.",
      });
    }
  }, [toast, toastMessage]);

  return (
    <>
      <div className={clsx("h-full", theme)}>
        <DesktopAside navigation={navigation} />
        <div className="flex h-full flex-col bg-white dark:bg-slate-950 md:pl-64">
          <NavTop user={user} userMenu={userNavigation} />
          <Outlet />
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div className="relative overflow-hidden bg-white py-16">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-prose text-lg">
            <h1>
              <span className="block text-center text-lg font-semibold text-cornflower-500">
                Error
              </span>
              <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                {error.status}
              </span>
            </h1>

            <pre className="mt-8 overflow-auto rounded-md border-2 border-gray-400 bg-white text-sm leading-8 text-gray-800">
              <code>{error.data.message}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="relative overflow-hidden bg-white py-16">
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-prose text-lg">
          <h1>
            <span className="block text-center text-lg font-semibold text-cornflower-500">
              Uh oh...
            </span>
          </h1>

          <pre className="mt-8 overflow-auto rounded-md border-2 border-gray-400 bg-white text-sm leading-8 text-gray-800">
            <code>{errorMessage}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
