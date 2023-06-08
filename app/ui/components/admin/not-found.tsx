export type NotFoundProps = {
  title?: string;
  description?: string;
} & React.HTMLAttributes<HTMLDivElement>;
export const NotFound = ({
  title = "404 Not found",
  description = "The page you are looking for does not exist. Please check the URL and try again.",
  children,
}: NotFoundProps) => {
  return (
    <div className="container mx-auto mt-32 flex min-h-[200px] max-w-xl flex-col justify-center gap-12 rounded-md border p-12 dark:border-slate-800">
      <h1 className="text-3xl font-semibold dark:text-slate-200">{title}</h1>
      <p className="text-slate-400 dark:text-slate-500">{description}</p>
      {children}
    </div>
  );
};
