import { MoonStar, Sun } from "lucide-react";

import { Theme } from "~/ui/components/theme-provider.tsx";
import { cn } from "~/ui/utils.ts";

const iconThemeMap = new Map([
  [Theme.LIGHT, Sun],
  [Theme.DARK, MoonStar],
]);

export interface ThemeToggleIconProps {
  theme: Theme;
  checked: boolean;
  className?: string;
}

export const ThemeToggleIcon = ({
  theme,
  checked,
  className,
}: ThemeToggleIconProps) => {
  const Component = iconThemeMap.get(theme);
  let colorClassName = "";
  if (checked) {
    switch (theme) {
      case Theme.LIGHT:
        colorClassName = "text-saffron-500";
        break;
      case Theme.DARK:
        colorClassName = "text-cornflower-500";
        break;
    }
  }

  if (Component) {
    return <Component key={theme} className={cn(colorClassName, className)} />;
  }

  return <></>;
};

export default ThemeToggleIcon;
