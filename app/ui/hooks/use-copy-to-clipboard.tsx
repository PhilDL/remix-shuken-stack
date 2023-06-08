"use client";

import { useToast } from "~/ui/hooks/use-toast.tsx";

export const useCopyToClipboard = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      duration: 3000,
      title: "Copied",
      description: (
        <div className="flex flex-col gap-3">
          <span>Media URL has been copied to clipboard.</span>
          <code className="text-xs">{text}</code>
        </div>
      ),
    });
  };

  return { copyToClipboard };
};
