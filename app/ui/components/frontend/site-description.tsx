import { BoxedContent } from "~/ui/components/frontend/boxed-content.tsx";
import { SocialLinks } from "~/ui/components/frontend/social-links.tsx";

export type SiteDescriptionProps = {
  className?: string;
  settings: { title: string; description?: string | null };
  titleElement: "h1" | "div";
};

export const SiteDescription = ({
  className,
  settings,
  titleElement,
}: SiteDescriptionProps) => {
  return (
    <BoxedContent className={className}>
      <BoxedContent.BoxedContentTitle as={titleElement}>
        {settings.title}
      </BoxedContent.BoxedContentTitle>
      <BoxedContent.BoxedContentBody className="gap-4 divide-none p-4">
        <p>{settings.description || "Placeholder description"}</p>
        <SocialLinks
          className="flex justify-start gap-2"
          facebook="#"
          twitter="#"
          linkedin="#"
          github="#"
          rss="#"
        />
      </BoxedContent.BoxedContentBody>
    </BoxedContent>
  );
};
