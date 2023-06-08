import * as React from "react";
import type { RenderableTreeNodes } from "@markdoc/markdoc";
import Markdoc from "@markdoc/markdoc";

import { Counter } from "./counter.tsx";
import { Fence } from "./fence.tsx";

type Props = { content: RenderableTreeNodes; className?: string };

export function Markdown({ content, className }: Props) {
  return (
    <div className={className ?? ""}>
      {Markdoc.renderers.react(content, React, {
        components: {
          Counter,
          Fence,
        },
      })}
    </div>
  );
}
