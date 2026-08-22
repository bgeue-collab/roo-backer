"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  useTransition,
  type ReactElement,
} from "react";
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
import { createTier, updateTier } from "@/app/actions/tiers";

export function TierFormDialog({
  tierId,
  initialValues,
  trigger,
}: {
  tierId?: string;
  initialValues?: { name: string; minAmount: string; sortOrder: number };
  trigger: ReactElement<{ onClick?: () => void }>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [minAmount, setMinAmount] = useState(initialValues?.minAmount ?? "");
  const [sortOrder, setSortOrder] = useState(
    String(initialValues?.sortOrder ?? 1)
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const values = {
          name,
          minAmount: Number(minAmount),
          sortOrder: Number(sortOrder),
        };
        if (tierId) {
          await updateTier(tierId, values);
          toast.success("Tier updated.");
        } else {
          await createTier(values);
          toast.success("Tier added.");
        }
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't save tier."
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isValidElement(trigger)
        ? cloneElement(trigger, { onClick: () => setOpen(true) })
        : trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tierId ? "Edit tier" : "Add tier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tierName">Tier name</Label>
            <Input
              id="tierName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minAmount">Minimum amount (AUD)</Label>
              <Input
                id="minAmount"
                type="number"
                min="0"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
