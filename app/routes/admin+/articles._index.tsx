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

export default function ArticlesIndex() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <PageContainer>
      <PageHeader
        title="Articles"
        subTitle="These are your articles"
        actions={
          <LinkButton to="/admin/articles/new" variant={"outline"}>
            New Article
          </LinkButton>
        }
      />
      <Table>
        <TableHeader>
          <TableCell>Title</TableCell>
          <TableCell>Tags</TableCell>
          <TableCell>Author</TableCell>
          <TableCell>Status</TableCell>
          <TableCell className="relative py-3.5 pl-3 pr-6">Actions</TableCell>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableEmptyState
              to="/admin/articles/new"
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
                      to={`/admin/articles/${post.slug}`}
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
    </PageContainer>
  );
}
