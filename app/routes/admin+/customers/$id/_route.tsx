import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Editor, type Monaco } from "@monaco-editor/react";
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, NavLink, useLoaderData, useNavigation } from "@remix-run/react";
import { ChevronLeftIcon, ChevronRightIcon, ColumnsIcon } from "lucide-react";
import type { editor } from "monaco-editor";
import invariant from "tiny-invariant";

import idify from "~/utils/slugify.ts";
import { Markdown } from "~/ui/components/markdoc/markdown.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import { getPostBySlug, updatePost } from "~/models/post.server.ts";
import { parseMarkdown } from "~/services/markdown.server.ts";

export async function loader({ request, params }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  let id = params.id;
  invariant(id, "Id is required");
  return json({ id });
}

export async function action({ request, params }: ActionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  let id = params.id;
  invariant(id, "Id is required");
  return json({ id });
}
export default function EditCustomer() {
  const { id } = useLoaderData<typeof loader>();

  return <div>customer id: {id}</div>;
}
