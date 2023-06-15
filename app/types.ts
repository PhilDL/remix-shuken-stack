import type { LoaderFunction } from "@remix-run/server-runtime";

export type UwrapJSONLoaderData<T extends LoaderFunction> = Awaited<
  ReturnType<Awaited<ReturnType<T>>["json"]>
>;

export type UwrapLoaderData<T extends LoaderFunction> = Awaited<ReturnType<T>>;

export type ObjectEntries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
