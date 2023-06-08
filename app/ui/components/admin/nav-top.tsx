import { Fragment, useEffect, useState } from "react";
import type { User } from "@prisma/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Link, useNavigation } from "@remix-run/react";
import {
  Bell,
  CreditCard,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  User as UserIcon,
  UserPlus,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/ui/components/avatar.tsx";
import { Button } from "~/ui/components/button.tsx";
import { CommandBar } from "~/ui/components/command-bar.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/ui/components/dropdown-menu.tsx";
import { NavbarListItemMobile } from "~/ui/components/frontend/navbar-list-item-mobile.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/components/sheet.tsx";
import { Theme, useTheme } from "~/ui/components/theme-provider.tsx";
import ThemeToggleIcon from "~/ui/components/theme-toggle-icon.tsx";
import { ThemeToggle } from "~/ui/components/theme-toggle.tsx";
import { nameInitials } from "~/ui/utils.ts";
import { site } from "~/settings.ts";

const themes = [Theme.LIGHT, Theme.DARK];

export type NavTopProps = {
  userMenu: {
    name: string;
    href: string;
  }[];
  user: Pick<User, "name" | "email" | "avatarImage"> | null;
};
export const NavTop = ({ userMenu, user }: NavTopProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const transition = useNavigation();

  useEffect(() => {
    if (transition.state === "idle") {
      setSidebarOpen(false);
    }
  }, [transition.state]);

  function handleChange() {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    );
  }
  return (
    <div className="sticky top-0 z-10 flex h-16 shrink-0 bg-white dark:bg-slate-950">
      <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <SheetTrigger asChild>
          <Button variant={"ghost"} size={"sm"} className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent position="right" size={"xl"}>
          <SheetHeader>
            <SheetTitle>{site.title}</SheetTitle>
            <SheetDescription>{site.description}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[80%] w-full">
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              {userMenu.map((menu) => (
                <NavbarListItemMobile
                  to={menu.href}
                  title={menu.name}
                  key={menu.href}
                >
                  {menu.name}
                </NavbarListItemMobile>
              ))}
            </ul>
          </ScrollArea>

          {/* <SheetFooter>Footer</SheetFooter> */}
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1 items-center justify-end gap-1 text-slate-700 opacity-100 dark:text-slate-100 lg:gap-0.5">
          <CommandBar />
          <ThemeToggle className="hidden lg:flex" />
          <Button type="button" variant={"ghost"}>
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"sm"}>
                {user ? (
                  <Avatar className="h-8 w-8 hover:cursor-pointer">
                    <AvatarImage src={user.avatarImage ?? undefined} />
                    <AvatarFallback>
                      {nameInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UserIcon className="h-6 w-6 hover:cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              ) : (
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Sign-In</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/join">
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Join</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}
              <DropdownMenuSeparator className="lg:hidden" />
              <DropdownMenuGroup className="lg:hidden">
                {themes.map((t) => (
                  <DropdownMenuItem key={t} onClick={handleChange} asChild>
                    <label>
                      <ThemeToggleIcon
                        theme={t}
                        checked={theme === t}
                        className="mr-2 h-4 w-4"
                      />
                      <span>{t === "light" ? "Light" : "Dark"}</span>
                      <input
                        type="radio"
                        name="theme-toggle-user"
                        className="absolute inset-0 z-[-1] opacity-0"
                        checked={theme === t}
                        value={t}
                        title={`Use ${t} theme`}
                        aria-label={`Use ${t} theme`}
                        onChange={handleChange}
                      />
                    </label>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
