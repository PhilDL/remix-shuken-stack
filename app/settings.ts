export type SiteSettings = {
  title: string;
  description: string;
  logo: string;
  navigation: {
    label: string;
    url: string;
  }[];
  secondaryNavigation: {
    label: string;
    url: string;
  }[];
  url?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
};

export const site: SiteSettings = {
  title: "Remix Shuken Stack",
  description: "Batteries included starter for Remix",
  logo: "/logo.png",
  navigation: [
    {
      label: "Home",
      url: "/",
    },
  ],
  secondaryNavigation: [],
};
