import { NavLink } from "@remix-run/react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

import { app } from "~/settings.ts";

export type DesktopAsideProps = {
  navigation: {
    name: string;
    href: string;
    LucideIcon: LucideIcon;
    children?: {
      name: string;
      href: string;
    }[];
  }[];
};
export const DesktopAside = ({ navigation }: DesktopAsideProps) => {
  return (
    <div className="hidden border-r border-r-slate-100 dark:border-r-slate-800 md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-slate-950">
        <NavLink
          to="/"
          className="flex h-16 shrink-0 items-center bg-white px-4 dark:bg-slate-950"
        >
          <img
            src="/logo-small.png"
            alt={`${app.title} Logo`}
            className="h-8"
          />
        </NavLink>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <div key={item.name}>
                <NavLink
                  to={item.href ?? "/"}
                  className={({ isActive }) =>
                    clsx(
                      isActive
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-50"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
                      "group flex items-center rounded-md p-2 text-sm font-medium"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.LucideIcon
                        className={clsx(
                          isActive
                            ? "text-slate-500 dark:text-slate-300"
                            : "text-slate-500 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300",
                          "mr-3 h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
                {item.children && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.href ?? "/"}
                        className={({ isActive }) =>
                          clsx(
                            isActive
                              ? " text-slate-600  dark:text-slate-100"
                              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white",
                            "group flex items-center rounded-md p-2 text-sm font-medium"
                          )
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
