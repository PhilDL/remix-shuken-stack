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

import slugify from "~/utils/slugify.ts";
import { Markdown } from "~/ui/components/markdoc/markdown.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import { getPostBySlug, updatePost } from "~/models/post.server.ts";
import { parseMarkdown } from "~/services/markdown.server.ts";

export async function loader({ request, params }: LoaderArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const slug = params.slug;
  invariant(slug, "Slug is required");
  const post = await getPostBySlug(slug);
  invariant(post, "Post not found");
  if (post.authorId !== user.id) {
    return redirect("/admin/articles");
  }
  let markdownContent = parseMarkdown(post.content || "");
  return json({ post, markdownContent });
}

export async function action({ request, params }: ActionArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  let slug = params.slug;
  invariant(slug, "Slug is required");
  const post = await getPostBySlug(slug);
  invariant(post, "Post not found");
  const formData = await request.formData();
  const content = formData.get("content");
  const title = formData.get("title") as string;
  let newSlug = formData.get("slug") as string;
  if (newSlug) {
    slug = slugify(newSlug, { strict: true, lower: true, trim: true });
    invariant(slug, "Slug is required");
  }

  invariant(title, "Title is required");
  const updatedPost = await updatePost(post.id, {
    title,
    slug,
    content: content as string,
    authorId: user.id,
  });
  invariant(updatedPost, "Post was not updated");
  return redirect(`/admin/articles/${updatedPost.slug}`);
}
export default function EditorPage() {
  const navigation = useNavigation();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const { post, markdownContent } = useLoaderData<typeof loader>();
  const [content, setContent] = useState<string>(post.content || "");

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;
  }

  function handleEditorChange(
    value: string | undefined,
    event: editor.IModelContentChangedEvent
  ) {
    setContent(value || "");
  }

  return (
    <>
      <Form className="min-h-full" method="post" id="postForm">
        <div className="bg-gray-800 pb-32">
          <header>
            <div className="flex items-center justify-between p-4">
              <div>
                <NavLink
                  to="/admin/articles"
                  className="flex items-center gap-2 rounded px-4 py-2 text-slate-400 hover:bg-slate-900"
                >
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />{" "}
                  Back
                </NavLink>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="rounded px-4 py-2 text-slate-400 hover:bg-slate-900"
                  type="submit"
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview
                </button>
                <button
                  className="rounded px-4 py-2 text-slate-400 hover:bg-slate-900"
                  type="submit"
                  disabled={navigation.state === "submitting"}
                >
                  {navigation.state === "submitting" ? "Saving..." : "Save"}
                </button>
                <button
                  className="rounded px-4 py-2 text-slate-400 hover:bg-slate-900"
                  onClick={() => setSidebarOpen(true)}
                  type="button"
                >
                  <ColumnsIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="mx-auto flex max-w-7xl flex-row justify-between px-4 py-8 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                <input
                  id="title"
                  name="title"
                  defaultValue={post.title}
                  className="w-full border-none bg-gray-800"
                ></input>
              </h1>
            </div>
          </header>
        </div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
            </Transition.Child>

            <div className="fixed z-10 h-full min-h-full w-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-100 -right-[999px]"
                enterFrom="opacity-0 sm:scale-100"
                enterTo="opacity-100 sm:scale-100 right-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 sm:scale-100 right-0"
                leaveTo="opacity-0 sm:scale-100 -right-[999px]"
              >
                <Dialog.Panel className="fixed right-0 top-0 m-0 h-full min-h-full overflow-scroll bg-gray-800 px-4 text-left text-slate-200 shadow-xl transition-all sm:w-full sm:max-w-sm">
                  <div className="flex w-full flex-row items-center justify-between py-4 pl-4">
                    <h2 className="text-xl font-bold">Post settings</h2>
                    <button
                      type="button"
                      className="rounded px-4 py-2 text-slate-400 hover:bg-slate-900"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <ChevronRightIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="slug" className="text-slate-400">
                        Slug
                      </label>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        defaultValue={post.slug}
                        className="rounded text-slate-900"
                        form="postForm"
                      />
                    </div>
                    <button
                      className="relative my-4 box-border flex w-full items-center justify-center rounded-md bg-cornflower-500 py-2 text-white"
                      type="submit"
                      disabled={navigation.state === "submitting"}
                      form="postForm"
                    >
                      {navigation.state === "submitting" ? "Saving..." : "Save"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <main className="-mt-32">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            {/* Replace with your content */}
            <textarea
              name="content"
              id="content"
              hidden
              value={content}
              readOnly
            />
            <Editor
              className="rounded-lg bg-[#1e1e1e] px-5 py-12 shadow sm:px-6"
              height="90vh"
              defaultLanguage="markdown"
              defaultValue={post.content || ""}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              onChange={handleEditorChange}
            />
            {/* /End replace */}
          </div>
          {/* <Markdown content={content} /> */}
        </main>
      </Form>
      <Transition.Root show={previewOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setPreviewOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-10 h-full min-h-full w-full">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 sm:scale-100"
              enterTo="opacity-100 sm:scale-100 right-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 sm:scale-100 right-0"
              leaveTo="opacity-0 sm:scale-100"
            >
              <Dialog.Panel className="prose fixed inset-0 m-0 mx-auto h-full min-h-full max-w-7xl overflow-scroll bg-white px-4 text-left text-slate-900 shadow-xl transition-all sm:w-full">
                <div className="flex w-full flex-row items-center justify-between py-4 pl-4">
                  <button
                    type="button"
                    className="rounded px-4 py-2 text-slate-400 hover:bg-slate-900"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <Markdown content={markdownContent} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
