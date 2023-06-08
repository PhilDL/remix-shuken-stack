import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  switch (search) {
    case "tags":
      const tags = [
        { name: "javascript", slug: "/" },
        { name: "typescript", slug: "/" },
      ];
      return json(
        {
          success: true,
          tags,
        },
        200
      );
    case "authors":
      const authors = [
        { name: "Philippe", slug: "/" },
        { name: "Egon", slug: "/" },
      ];
      return json(
        {
          success: true,
          authors,
        },
        200
      );
    default:
      break;
  }
  return json({ success: true }, 200);
};
