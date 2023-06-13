import { useRef, useState } from "react";
import { Editor, type Monaco } from "@monaco-editor/react";
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { ChevronLeftIcon, ColumnsIcon } from "lucide-react";
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
import { createPost } from "~/models/post.server.ts";

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  return json({ markdownContent: "# My title" });
}

export async function action({ request }: ActionArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const userId = user.id;
  const formData = await request.formData();
  const content = formData.get("content");
  const title = formData.get("title") as string;
  invariant(title, "Title is required");
  let slug = formData.get("slug") as string;
  if (!slug) {
    slug = slugify(title, { strict: true, lower: true, trim: true });
  }
  invariant(slug, "Slug is required");

  const post = await createPost({
    title,
    slug,
    content: content as string,
    authorId: userId,
  });
  invariant(post, "Post was not created");
  return redirect(`/admin/posts/${post.slug}`);
}

export default function NewArticle() {
  const navigation = useNavigation();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { markdownContent } = useLoaderData<typeof loader>();
  const [content, setContent] = useState<string>(markdownContent);

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
                <NavLinkButton to="/admin/posts" variant={"outline"}>
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
                  className="w-full border-none text-3xl"
                  defaultValue={"My new Article"}
                />
              </h1>
            </div>
          </header>
        </div>

        <main className="-mt-32">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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
              defaultValue={markdownContent}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              onChange={handleEditorChange}
            />
          </div>
        </main>
      </Form>
    </>
  );
}
