import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BookOpen, MoreHorizontal } from "lucide-react";

import { PageContainer } from "~/ui/components/admin/page-container.tsx";
import { PageHeader } from "~/ui/components/admin/page-header.tsx";
import { Button } from "~/ui/components/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/ui/components/dropdown-menu.tsx";
import { LinkButton } from "~/ui/components/link-button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/components/table.tsx";
import { auth } from "~/storage/auth.server.ts";
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
              <TableHead></TableHead>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/posts/${post.slug}`}>Edit</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
