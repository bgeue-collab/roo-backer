"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";

type Deliverable = {
  title: string;
  dueDate: string;
  completed: boolean;
};

export function DraftEmailButton({
  sponsorName,
  contactEmail,
  tierName,
  orgName,
  deliverables,
  doNotContact = false,
  doNotContactReason,
}: {
  sponsorName: string;
  contactEmail: string | null;
  tierName: string;
  orgName: string;
  deliverables: Deliverable[];
  doNotContact?: boolean;
  doNotContactReason?: string | null;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function draftEmail() {
    const completed = deliverables.filter((d) => d.completed);
    const upcoming = deliverables
      .filter((d) => !d.completed)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const lines = [
      `Hi ${sponsorName},`,
      "",
      `Thanks again for your support as a ${tierName} sponsor of ${orgName}. Here's a quick update on where things stand:`,
      "",
    ];

    if (completed.length > 0) {
      lines.push("Completed so far:");
      for (const item of completed) {
        lines.push(`- ${item.title}`);
      }
      lines.push("");
    }

    if (upcoming.length > 0) {
      lines.push("Coming up:");
      for (const item of upcoming) {
        lines.push(`- ${item.title} (due ${formatDate(item.dueDate)})`);
      }
      lines.push("");
    }

    lines.push("Thanks again for your support.", "", `The ${orgName} team`);

    const body = lines.join("\n");
    const subject = `${orgName} sponsorship update`;
    const to = contactEmail ?? "";
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  function handleClick() {
    if (doNotContact) {
      setConfirmOpen(true);
      return;
    }
    draftEmail();
  }

  return (
    <>
      <Button variant="outline" onClick={handleClick}>
        Draft update email
      </Button>
      {doNotContact ? (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>This sponsor is marked Do Not Contact</AlertDialogTitle>
              <AlertDialogDescription>
                {doNotContactReason ? `Reason: ${doNotContactReason}. ` : ""}
                Are you sure you want to draft an email to {sponsorName}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={draftEmail}>
                Draft anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
