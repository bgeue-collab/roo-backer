"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createSponsor, updateSponsor } from "@/app/actions/sponsors";

export type ContactFormValue = {
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

export type LiaisonFormValue = {
  volunteerName: string;
  volunteerEmail: string;
  isPrimary: boolean;
};

export type SponsorFormValues = {
  name: string;
  pledgedAmount: string;
  notes: string;
  sponsorshipStartDate: string;
  xeroContactId: string;
  socials: { platform: string; handle: string }[];
  contacts: ContactFormValue[];
  liaisons: LiaisonFormValue[];
};

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

const emptyValues: SponsorFormValues = {
  name: "",
  pledgedAmount: "",
  notes: "",
  sponsorshipStartDate: todayISODate(),
  xeroContactId: "",
  socials: [],
  contacts: [],
  liaisons: [],
};

const VOLUNTEER_NAME_DATALIST_ID = "sponsor-liaison-volunteer-names";

export function SponsorForm({
  mode,
  sponsorId,
  initialValues,
  volunteerNameSuggestions = [],
  onSuccess,
}: {
  mode: "create" | "edit";
  sponsorId?: string;
  initialValues?: SponsorFormValues;
  volunteerNameSuggestions?: string[];
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

  function addContactRow() {
    setValues((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          name: "",
          role: "",
          email: "",
          phone: "",
          isPrimary: prev.contacts.length === 0,
        },
      ],
    }));
  }

  function removeContactRow(index: number) {
    setValues((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  }

  function updateContactRow(
    index: number,
    field: "name" | "role" | "email" | "phone",
    value: string
  ) {
    setValues((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ),
    }));
  }

  function setContactPrimary(index: number) {
    setValues((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => ({
        ...contact,
        isPrimary: i === index,
      })),
    }));
  }

  function addLiaisonRow() {
    setValues((prev) => ({
      ...prev,
      liaisons: [
        ...prev.liaisons,
        {
          volunteerName: "",
          volunteerEmail: "",
          isPrimary: prev.liaisons.length === 0,
        },
      ],
    }));
  }

  function removeLiaisonRow(index: number) {
    setValues((prev) => ({
      ...prev,
      liaisons: prev.liaisons.filter((_, i) => i !== index),
    }));
  }

  function updateLiaisonRow(
    index: number,
    field: "volunteerName" | "volunteerEmail",
    value: string
  ) {
    setValues((prev) => ({
      ...prev,
      liaisons: prev.liaisons.map((liaison, i) =>
        i === index ? { ...liaison, [field]: value } : liaison
      ),
    }));
  }

  function setLiaisonPrimary(index: number) {
    setValues((prev) => ({
      ...prev,
      liaisons: prev.liaisons.map((liaison, i) => ({
        ...liaison,
        isPrimary: i === index,
      })),
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sponsorshipStartDate">Sponsorship start date</Label>
          <Input
            id="sponsorshipStartDate"
            type="date"
            value={values.sponsorshipStartDate}
            onChange={(e) => updateField("sponsorshipStartDate", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="xeroContactId">Xero contact ID</Label>
        <Input
          id="xeroContactId"
          value={values.xeroContactId}
          onChange={(e) => updateField("xeroContactId", e.target.value)}
        />
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
          <Label>Contacts</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addContactRow}
          >
            <Plus className="size-4" />
            Add contact
          </Button>
        </div>
        {values.contacts.map((contact, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border p-2.5">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Name"
                value={contact.name}
                onChange={(e) => updateContactRow(index, "name", e.target.value)}
              />
              <Input
                placeholder="Role (e.g. Marketing Manager)"
                value={contact.role}
                onChange={(e) => updateContactRow(index, "role", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeContactRow(index)}
                aria-label="Remove contact"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Email"
                value={contact.email}
                onChange={(e) => updateContactRow(index, "email", e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={contact.phone}
                onChange={(e) => updateContactRow(index, "phone", e.target.value)}
              />
              <Button
                type="button"
                variant={contact.isPrimary ? "secondary" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => setContactPrimary(index)}
              >
                {contact.isPrimary ? "Primary" : "Set primary"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Internal liaison</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLiaisonRow}
          >
            <Plus className="size-4" />
            Add liaison
          </Button>
        </div>
        {values.liaisons.map((liaison, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              list={VOLUNTEER_NAME_DATALIST_ID}
              placeholder="Vol name"
              value={liaison.volunteerName}
              onChange={(e) =>
                updateLiaisonRow(index, "volunteerName", e.target.value)
              }
            />
            <Input
              type="email"
              placeholder="Vol email "
              value={liaison.volunteerEmail}
              onChange={(e) =>
                updateLiaisonRow(index, "volunteerEmail", e.target.value)
              }
            />
            <Button
              type="button"
              variant={liaison.isPrimary ? "secondary" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setLiaisonPrimary(index)}
            >
              {liaison.isPrimary ? "Primary" : "Set primary"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLiaisonRow(index)}
              aria-label="Remove liaison"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <datalist id={VOLUNTEER_NAME_DATALIST_ID}>
          {volunteerNameSuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
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
