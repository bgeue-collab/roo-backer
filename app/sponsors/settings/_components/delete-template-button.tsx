"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteDeliverableTemplate } from "@/app/actions/tiers";

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteDeliverableTemplate(templateId);
        toast.success("Deliverable template removed.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't remove template."
        );
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      aria-label="Remove deliverable template"
    >
      <X className="size-4" />
    </Button>
  );
}
