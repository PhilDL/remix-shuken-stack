import { Suspense } from "react";
import { json, type LoaderArgs } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";

import { Badge } from "~/ui/components/badge.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { ScrollArea } from "~/ui/components/scroll-area.tsx";
import { Skeleton } from "~/ui/components/skeleton.tsx";
import { site } from "~/settings.ts";

export async function loader({ request }: LoaderArgs) {
  const settings = site;
  return json({ settings });
}

export default function Settings() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <ScrollArea className="flex h-[500px] rounded-md border p-4">
        <div className="mb-8 flex flex-row items-baseline justify-between">
          <h2 className="font-semibold">Ghost Admin Settings</h2>
          <Badge
            variant={"outline"}
            className="flex flex-row items-start justify-between gap-3"
          >
            Connected{" "}
            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-lime-500" />
          </Badge>
        </div>

        <div className="flex flex-col gap-5 px-1">
          <Suspense
            fallback={
              <div className="grid w-full items-center gap-5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            }
          >
            <Await
              resolve={data.settings}
              errorElement={<p>Error loading Ghost settings!</p>}
            >
              {(settings) => (
                <>
                  {Object.entries(settings).map(([key, value]) => (
                    <div
                      className="relative grid w-full items-center gap-1.5"
                      key={key}
                    >
                      <Label
                        className="absolute -top-2 left-2 bg-background"
                        htmlFor={key}
                      >
                        {key}
                      </Label>
                      <Input
                        type="text"
                        name={key}
                        id={key}
                        defaultValue={String(value)}
                        readOnly
                      />
                    </div>
                  ))}
                </>
              )}
            </Await>
          </Suspense>
        </div>
      </ScrollArea>
    </div>
  );
}
