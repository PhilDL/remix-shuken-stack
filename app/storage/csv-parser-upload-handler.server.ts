import { Readable } from "stream";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from "@remix-run/node";
import { parse } from "csv-parse";

export const csvParserUploadHandler = composeUploadHandlers(
  async ({ name, contentType, data, filename }) => {
    if (!filename) {
      return undefined;
    }
    if (!contentType.startsWith("text/csv")) {
      return undefined;
    }
    console.log("Do something");
    const parser = Readable.from(data).pipe(
      parse({
        // CSV options if any
        columns: true,
        trim: true,
      })
    );
    for await (const record of parser) {
      // Work with each record
      console.log(record);
    }
    return undefined;
  },
  // fallback to memory for everything else
  createMemoryUploadHandler()
);
