import { cn } from "~/ui/utils.ts";

export type PageContainerProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const PageContainer = ({
  children,
  className,
  ...rest
}: PageContainerProps) => {
  return (
    <div
      className={cn(
        "mt-4 h-full bg-white px-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 lg:px-8 flex flex-col gap-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
