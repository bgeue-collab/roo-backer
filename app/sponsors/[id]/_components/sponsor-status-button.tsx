"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setSponsorStatus } from "@/app/actions/sponsors";

export function SponsorStatusButton({
  sponsorId,
  sponsorName,
  status,
}: {
  sponsorId: string;
  sponsorName: string;
  status: "active" | "inactive";
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function apply(next: "active" | "inactive", regenerateDeliverables = false) {
    startTransition(async () => {
      try {
        await setSponsorStatus(sponsorId, { status: next, regenerateDeliverables });
        toast.success(
          next === "active" ? `${sponsorName} reactivated.` : `${sponsorName} marked inactive.`
        );
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't update sponsor status."
        );
      }
    });
  }

  if (status === "active") {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Deactivate
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {sponsorName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Inactive sponsors are hidden from the default list and dashboard
              stats, and stop getting new deliverables auto-created. All their
              existing contacts, payments, and deliverable history are kept —
              this isn&apos;t a delete, and you can reactivate them any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => apply("inactive")}
            >
              {isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Reactivate
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivate {sponsorName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This brings them back into the default list and dashboard stats.
            You can optionally regenerate a fresh set of tier deliverables
            (including a new renewal reminder), dated from today, as if
            they&apos;d just signed on again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={() => apply("active", false)}
          >
            Reactivate only
          </Button>
          <Button disabled={isPending} onClick={() => apply("active", true)}>
            Reactivate &amp; regenerate deliverables
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
