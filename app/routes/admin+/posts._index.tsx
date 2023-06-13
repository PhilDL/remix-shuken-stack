import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookOpen } from "lucide-react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { LinkButton } from "~/ui/components/link-button.tsx";
import { NavLinkButton } from "~/ui/components/navlink-button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/components/table.tsx";
import { auth } from "~/storage/admin-auth.server.ts";
import { getAllUserPosts } from "~/models/post.server.ts";

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/admin/login",
  });
  const posts = await getAllUserPosts(user.id);
  return json({ posts });
}

export default function PostsIndex() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <PageContainer>
      <PageHeader
        title="Posts"
        subTitle="These are your posts"
        actions={
          <LinkButton to="/admin/posts/new" variant={"outline"}>
            New Article
          </LinkButton>
        }
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableCell className="relative py-3.5 pl-3 pr-6">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableEmptyState
                to="/admin/posts/new"
                LucideIcon={BookOpen}
                message="Create a new Post"
              />
            ) : (
              <>
                {posts.map((post) => (
                  <TableRow key={post.slug}>
                    <TableCell className="font-semibold dark:text-slate-50">
                      {post.title}
                    </TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>{post.authorId}</TableCell>
                    <TableCell>
                      {post.publishedAt ? "Published" : "Draft"}
                    </TableCell>
                    <TableCell>
                      <NavLinkButton
                        to={`/admin/posts/${post.slug}`}
                        variant={"link"}
                      >
                        Edit
                      </NavLinkButton>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
