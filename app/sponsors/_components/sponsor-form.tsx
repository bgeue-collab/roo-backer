"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createSponsor, updateSponsor } from "@/app/actions/sponsors";

export type SponsorFormValues = {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pledgedAmount: string;
  notes: string;
  socials: { platform: string; handle: string }[];
};

const emptyValues: SponsorFormValues = {
  name: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  pledgedAmount: "",
  notes: "",
  socials: [],
};

export function SponsorForm({
  mode,
  sponsorId,
  initialValues,
  onSuccess,
}: {
  mode: "create" | "edit";
  sponsorId?: string;
  initialValues?: SponsorFormValues;
  onSuccess: (result: { sponsorId: string; tierChanged?: boolean }) => void;
}) {
  const [values, setValues] = useState<SponsorFormValues>(
    initialValues ?? emptyValues
  );
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof SponsorFormValues>(
    key: K,
    value: SponsorFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addSocialRow() {
    setValues((prev) => ({
      ...prev,
      socials: [...prev.socials, { platform: "", handle: "" }],
    }));
  }

  function removeSocialRow(index: number) {
    setValues((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  }

  function updateSocialRow(
    index: number,
    field: "platform" | "handle",
    value: string
  ) {
    setValues((prev) => ({
      ...prev,
      socials: prev.socials.map((social, i) =>
        i === index ? { ...social, [field]: value } : social
      ),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (mode === "create") {
          const sponsor = await createSponsor(values);
          toast.success(`${sponsor.name} added as a sponsor.`);
          onSuccess({ sponsorId: sponsor.id });
        } else {
          if (!sponsorId) throw new Error("Missing sponsor id");
          const result = await updateSponsor(sponsorId, values);
          toast.success("Sponsor details updated.");
          onSuccess({ sponsorId, tierChanged: result.tierChanged });
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Sponsor name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactName">Contact name</Label>
          <Input
            id="contactName"
            value={values.contactName}
            onChange={(e) => updateField("contactName", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={values.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input
            id="contactPhone"
            value={values.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pledgedAmount">Pledged amount (AUD)</Label>
          <Input
            id="pledgedAmount"
            type="number"
            min="0"
            step="0.01"
            value={values.pledgedAmount}
            onChange={(e) => updateField("pledgedAmount", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={values.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Social handles</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialRow}
          >
            <Plus className="size-4" />
            Add handle
          </Button>
        </div>
        {values.socials.map((social, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Platform (e.g. Instagram)"
              value={social.platform}
              onChange={(e) =>
                updateSocialRow(index, "platform", e.target.value)
              }
            />
            <Input
              placeholder="Handle"
              value={social.handle}
              onChange={(e) =>
                updateSocialRow(index, "handle", e.target.value)
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSocialRow(index)}
              aria-label="Remove handle"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending
          ? "Saving..."
          : mode === "create"
            ? "Add sponsor"
            : "Save changes"}
      </Button>
    </form>
  );
}
