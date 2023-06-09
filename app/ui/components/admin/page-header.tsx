import { cn } from "~/ui/utils.ts";

export type PageHeaderProps = {
  actions?: React.ReactNode;
  title: string;
  subTitle?: React.ReactNode;
  className?: string;
};
export const PageHeader = ({
  actions,
  className,
  title,
  subTitle,
}: PageHeaderProps) => {
  return (
    <div className={cn("sm:flex sm:items-center", className)}>
      <div className="sm:flex-auto">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subTitle && (
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-600">
            {subTitle}
          </p>
        )}
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">{actions}</div>
    </div>
  );
};
