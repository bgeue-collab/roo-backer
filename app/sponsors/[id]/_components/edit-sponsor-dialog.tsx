"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SponsorForm, type SponsorFormValues } from "../../_components/sponsor-form";

export function EditSponsorDialog({
  sponsorId,
  initialValues,
  volunteerNameSuggestions = [],
}: {
  sponsorId: string;
  initialValues: SponsorFormValues;
  volunteerNameSuggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit sponsor</DialogTitle>
        </DialogHeader>
        <SponsorForm
          mode="edit"
          sponsorId={sponsorId}
          initialValues={initialValues}
          volunteerNameSuggestions={volunteerNameSuggestions}
          onSuccess={({ tierChanged }) => {
            setOpen(false);
            router.refresh();
            if (tierChanged) {
              toast.info(
                "Tier changed — deliverables weren't adjusted automatically. Review them manually.",
                { duration: 8000 }
              );
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
