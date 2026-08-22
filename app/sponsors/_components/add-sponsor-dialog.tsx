"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SponsorForm } from "./sponsor-form";

export function AddSponsorDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add sponsor
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add sponsor</DialogTitle>
        </DialogHeader>
        <SponsorForm
          mode="create"
          onSuccess={({ sponsorId }) => {
            setOpen(false);
            router.push(`/sponsors/${sponsorId}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
