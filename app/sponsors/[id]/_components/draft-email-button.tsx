"use client";

import { Button } from "@/components/ui/button";
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
}: {
  sponsorName: string;
  contactEmail: string | null;
  tierName: string;
  orgName: string;
  deliverables: Deliverable[];
}) {
  function handleClick() {
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

  return (
    <Button variant="outline" onClick={handleClick}>
      Draft update email
    </Button>
  );
}
