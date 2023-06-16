import { useEffect, useRef, useState } from "react";
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { parse } from "csv-parse";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { Button } from "~/ui/components/button.tsx";
import {
  FileInput,
  type FileInputHandle,
} from "~/ui/components/file-input.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/components/table.tsx";
import { auth } from "~/storage/auth.server.ts";
import { csvParserUploadHandler } from "~/storage/csv-parser-upload-handler.server.ts";
import { getAllMedias } from "~/models/medias.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const medias = await getAllMedias();
  return json({ medias });
}

export async function action({ request }: ActionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  await parseMultipartFormData(request, csvParserUploadHandler);
  return json({
    ok: true,
  });
}
export default function CSVUpload() {
  const fetcher = useFetcher();
  const [newFile, setNewFile] = useState<File>();
  const [records, setRecords] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<FileInputHandle>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      setNewFile(undefined);
      fileInputRef.current?.reset();
    }
  }, [fetcher]);

  useEffect(() => {
    if (newFile) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(newFile);
      reader.onloadend = async (e) => {
        const csv = new TextDecoder("utf-8").decode(
          new Uint8Array(e.target?.result as ArrayBuffer)
        );
        const records = parse(csv, {
          columns: true,
          skip_empty_lines: true,
        });
        for await (const record of records) {
          // Work with each record
          setRecords((records) => [...records, record]);
          if (!headers.length) {
            setHeaders(Object.keys(record));
          }
        }
      };
    } else {
      setRecords([]);
      setHeaders([]);
    }
  }, [newFile, headers]);

  return (
    <PageContainer>
      <PageHeader
        title="CSV Uploads"
        subTitle="This is a CSV Upload example."
      />
      <main>
        <div className="flex flex-col gap-4">
          <fetcher.Form
            method="post"
            className="border-1 relative flex h-full min-h-[260px] w-full flex-col gap-3 rounded-md border border-input p-2"
            encType="multipart/form-data"
          >
            <FileInput
              imageUrl=""
              ref={fileInputRef}
              inputName="newFile"
              onChange={(data) => {
                setNewFile(data);
              }}
              acceptedContentTypes={["text/csv"]}
              className="flex-1"
              placeholder="CSV File Up to 10MB"
            />
            {fetcher.state === "submitting" &&
              fetcher.submission.formData.get("action") === "new" && (
                <div className="absolute -ml-2 -mt-2 flex h-full w-full animate-pulse items-center justify-center rounded-md bg-black/10 text-white backdrop-blur-sm"></div>
              )}
            <div className="flex h-5 flex-row items-center justify-between">
              <span className="text-xs font-bold text-foreground ">
                {newFile && newFile.name ? newFile.name : "Upload a new file"}
              </span>
              {newFile && newFile.name && (
                <Button
                  variant={"link"}
                  type="submit"
                  name="action"
                  value="new"
                  disabled={
                    fetcher.state === "submitting" ||
                    fetcher.state === "loading"
                  }
                >
                  {fetcher.state === "submitting" || fetcher.state === "loading"
                    ? "Uploading"
                    : "Save"}
                </Button>
              )}
            </div>
          </fetcher.Form>
          {records.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h, index) => (
                      <TableHead key={index}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, index) => (
                    <TableRow key={index}>
                      {Object.entries(r).map(([key, value]) => (
                        <TableCell key={`${index}-${key}`}>
                          <span className="text-xs text-foreground ">
                            {value}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </PageContainer>
  );
}
