"use client";

import { cloneElement, isValidElement, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertDeliverableTemplate } from "@/app/actions/tiers";

type Template = {
  id: string;
  title: string;
  description: string | null;
  weeksFromStart: number;
  resourceUrl: string | null;
};

export function DeliverableTemplateDialog({
  tierId,
  template,
  trigger,
}: {
  tierId: string | null;
  template?: Template;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(template?.title ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [weeksFromStart, setWeeksFromStart] = useState(
    String(template?.weeksFromStart ?? 1)
  );
  const [resourceUrl, setResourceUrl] = useState(template?.resourceUrl ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await upsertDeliverableTemplate({
          id: template?.id,
          tierId,
          title,
          description,
          weeksFromStart: Number(weeksFromStart),
          resourceUrl,
        });
        toast.success(template ? "Deliverable template updated." : "Deliverable template added.");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't save template."
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isValidElement<{ onClick?: () => void }>(trigger)
        ? cloneElement(trigger, { onClick: () => setOpen(true) })
        : trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit deliverable template" : "Add deliverable template"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weeksFromStart">Weeks from signup</Label>
            <Input
              id="weeksFromStart"
              type="number"
              min="0"
              value={weeksFromStart}
              onChange={(e) => setWeeksFromStart(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resourceUrl">Resource link (optional)</Label>
            <Input
              id="resourceUrl"
              type="url"
              placeholder="https://drive.google.com/..."
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
