"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { completeDeliverable, updateDueDate } from "@/app/actions/deliverables";

type Deliverable = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  completed: boolean;
  completedAt: string | Date | null;
  completedBy: string | null;
  dueDateOverridden: boolean;
};

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function DeliverableRow({
  deliverable,
  sponsorId,
}: {
  deliverable: Deliverable;
  sponsorId: string;
}) {
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [dueDateDraft, setDueDateDraft] = useState(deliverable.dueDate);
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      try {
        await completeDeliverable(deliverable.id, sponsorId);
        toast.success(`Marked "${deliverable.title}" as done.`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't mark as done."
        );
      }
    });
  }

  function handleDueDateSave() {
    startTransition(async () => {
      try {
        await updateDueDate(deliverable.id, sponsorId, dueDateDraft);
        toast.success("Due date updated.");
        setEditingDueDate(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't update due date."
        );
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{deliverable.title}</span>
        {deliverable.description ? (
          <span className="text-sm text-muted-foreground">
            {deliverable.description}
          </span>
        ) : null}

        {deliverable.completed ? (
          <span className="text-sm text-muted-foreground">
            Done {formatDate(deliverable.completedAt!)}
            {deliverable.completedBy ? ` by ${deliverable.completedBy}` : ""}
          </span>
        ) : editingDueDate ? (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dueDateDraft}
              onChange={(e) => setDueDateDraft(e.target.value)}
              className="h-8 w-40"
            />
            <Button size="sm" disabled={isPending} onClick={handleDueDateSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => setEditingDueDate(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="w-fit text-sm text-muted-foreground underline decoration-dotted underline-offset-2"
            onClick={() => setEditingDueDate(true)}
          >
            Due {formatDate(deliverable.dueDate)}
            {deliverable.dueDateOverridden ? " (adjusted)" : ""}
          </button>
        )}
      </div>

      {!deliverable.completed ? (
        <Button size="sm" disabled={isPending} onClick={handleComplete}>
          Mark done
        </Button>
      ) : null}
    </div>
  );
}

export function DeliverablesPanel({
  deliverables,
  sponsorId,
}: {
  deliverables: Deliverable[];
  sponsorId: string;
}) {
  const today = todayISODate();
  const overdue = deliverables.filter(
    (d) => !d.completed && d.dueDate < today
  );
  const upcoming = deliverables.filter(
    (d) => !d.completed && d.dueDate >= today
  );
  const done = deliverables.filter((d) => d.completed);

  return (
    <div className="flex flex-col gap-5">
      <DeliverableGroup
        title="Overdue"
        badgeVariant="destructive"
        items={overdue}
        sponsorId={sponsorId}
      />
      <DeliverableGroup
        title="Upcoming"
        badgeVariant="secondary"
        items={upcoming}
        sponsorId={sponsorId}
      />
      <DeliverableGroup
        title="Done"
        badgeVariant="outline"
        items={done}
        sponsorId={sponsorId}
      />
    </div>
  );
}

function DeliverableGroup({
  title,
  badgeVariant,
  items,
  sponsorId,
}: {
  title: string;
  badgeVariant: "destructive" | "secondary" | "outline";
  items: Deliverable[];
  sponsorId: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant={badgeVariant}>{items.length}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((deliverable) => (
          <DeliverableRow
            key={deliverable.id}
            deliverable={deliverable}
            sponsorId={sponsorId}
          />
        ))}
      </div>
    </div>
  );
}
