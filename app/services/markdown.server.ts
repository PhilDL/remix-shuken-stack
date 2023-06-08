import fs from "fs";
import path from "path";
import Markdoc from "@markdoc/markdoc";
import type { RenderableTreeNodes } from "@markdoc/markdoc";

import { scheme as counter } from "~/ui/components/markdoc/counter.tsx";

const config = {
  tags: {
    counter,
  },
  nodes: {
    fence: {
      attributes: {
        ...Markdoc.nodes.fence.attributes,
        filename: { type: String, optional: true },
        hidden: { type: Boolean, optional: true },
        active: { type: Boolean, optional: true },
        language: {
          type: String,
        },
      },
      render: "Fence",
    },
  },
  variables: {
    user: {
      paid_subscription: true,
    },
  },
};

export function parseMarkdown(markdown: string): RenderableTreeNodes {
  let parsed = Markdoc.parse(markdown);
  return Markdoc.transform(parsed, config);
}

/**
 * Read content from a markdoc file in the folder `app/markdoc`
 * @param name Name of the file
 * @returns text content
 */
export const loadFile = (name: string) => {
  const filePath = path.join(process.cwd(), "app/markdoc", name);
  return fs.readFileSync(filePath, "utf8");
};
