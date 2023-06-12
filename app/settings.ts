export type SiteNavigation = {
  main: {
    label: string;
    url: string;
  }[];
  secondary: {
    label: string;
    url: string;
  }[];
};

export const navigation: SiteNavigation = {
  main: [
    {
      label: "Home",
      url: "/",
    },
  ],
  secondary: [],
};

export type AppSettings = {
  title: string;
  description: string;
};

export const app: AppSettings = {
  title: "Shuken App",
  description: "Starter Project",
};
