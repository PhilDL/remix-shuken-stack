import { Fragment, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { Editor, type Monaco } from "@monaco-editor/react";
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, NavLink, useLoaderData, useNavigation } from "@remix-run/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ColumnsIcon,
  TowerControl,
} from "lucide-react";
import type { editor } from "monaco-editor";
import invariant from "tiny-invariant";

import slugify from "~/utils/slugify.ts";
import { Button } from "~/ui/components/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/components/dialog.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { Markdown } from "~/ui/components/markdoc/markdown.tsx";
import { NavLinkButton } from "~/ui/components/navlink-button.tsx";
import { SaveButton } from "~/ui/components/save-button.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/components/sheet.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import { getPostBySlug, updatePost } from "~/models/post.server.ts";
import { parseMarkdown } from "~/services/markdown.server.ts";
import medias from "../admin+/medias.tsx";

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
        <div className="bg-muted pb-32">
          <header>
            <div className="flex items-center justify-between p-4">
              <div>
                <NavLinkButton to="/admin/articles" variant={"outline"}>
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />{" "}
                  Back
                </NavLinkButton>
              </div>
              <div className="flex items-center gap-4">
                <SaveButton
                  type="submit"
                  variant={"default"}
                  navigationState={navigation.state}
                >
                  Save
                </SaveButton>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant={"outline"}>Preview</Button>
                  </DialogTrigger>
                  <DialogContent className="mx-auto flex h-[80%] min-h-[80%] max-w-7xl flex-col justify-start gap-12 overflow-scroll px-4 text-left shadow-xl sm:w-full">
                    <DialogHeader>
                      <DialogTitle>Post preview</DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                      <div className="min-w-7xl prose mx-auto w-full justify-start">
                        <Markdown content={markdownContent} />
                      </div>
                    </DialogDescription>
                    <DialogFooter>
                      {/* <Button type="submit" form={formId} variant="default" size="sm">
              Add
            </Button> */}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant={"outline"}>
                      <ColumnsIcon className="h-6 w-6" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent position={"right"} size="content">
                    <SheetHeader>
                      <SheetTitle>Post Settings</SheetTitle>
                      <SheetDescription>Edit article data.</SheetDescription>
                    </SheetHeader>
                    <div className="flex min-w-[350px] flex-col gap-8">
                      <div className="mt-8 flex flex-col gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          type="text"
                          id="slug"
                          name="slug"
                          defaultValue={post.slug}
                          form="postForm"
                        />
                      </div>
                      <SaveButton
                        variant={"default"}
                        type="submit"
                        form="postForm"
                        navigationState={navigation.state}
                      >
                        Save
                      </SaveButton>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <div className="mx-auto flex max-w-7xl flex-row justify-between px-4 py-8 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight">
                <Input
                  id="title"
                  name="title"
                  defaultValue={post.title}
                  className="w-full border-none text-3xl"
                />
              </h1>
            </div>
          </header>
        </div>

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
    </>
  );
}
