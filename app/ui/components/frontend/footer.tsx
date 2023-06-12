import { Link } from "@remix-run/react";

import { SocialLinks } from "~/ui/components/frontend/social-links.tsx";
import { navigation } from "~/settings.ts";

export type FooterProps = {
  settings: {
    title: string;
    description?: string | null;
    logo?: string | null;
  };
};

export const Footer = ({ settings }: FooterProps) => {
  return (
    <footer className="flex flex-col gap-3">
      <div className="rounded bg-black p-3 dark:bg-slate-900 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="lg:flex lg:flex-1 lg:flex-col lg:gap-4">
            <img src={settings.logo ?? ""} alt="" className="w-40" />
            <p className="max-w-[30ch] text-slate-400">
              {settings.description}
            </p>
            <SocialLinks
              className="flex justify-start gap-2"
              facebook="#"
              twitter="#"
              linkedin="#"
              github="#"
              rss="#"
            />
          </div>

          <div className="lg:flex lg:flex-1 lg:flex-col lg:gap-4">
            <h3 className="font-bold text-white">Navigation</h3>
            <div className="flex">
              <ul className="flex-1 text-slate-400">
                {navigation.main.map((item) => (
                  <li key={item.url}>
                    <Link to={item.url} className="hover:text-cornflower-500">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="flex-1 text-slate-400">
                {navigation.secondary.map((item) => (
                  <li key={item.url}>
                    <Link to={item.url} className="hover:text-cornflower-500">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:flex-1"></div>
        </div>
      </div>
      <div className="py-4 text-center text-slate-600 dark:text-slate-300">
        ©{settings.title} {new Date().getFullYear()}. All rights reserved.
      </div>
    </footer>
  );
};
