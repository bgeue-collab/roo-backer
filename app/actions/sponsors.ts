"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { emptyToNull } from "@/lib/form-utils";
import {
  createSponsor as createSponsorDb,
  updateSponsor as updateSponsorDb,
  deleteSponsor as deleteSponsorDb,
  setSponsorStatus as setSponsorStatusDb,
} from "@/lib/db/sponsors";

const socialSchema = z.object({
  platform: z.string().trim().min(1, "Platform is required"),
  handle: z.string().trim().min(1, "Handle is required"),
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),
  role: z.preprocess(emptyToNull, z.string().trim().nullable()),
  email: z.preprocess(
    emptyToNull,
    z.string().trim().email("Enter a valid email").nullable()
  ),
  phone: z.preprocess(emptyToNull, z.string().trim().nullable()),
  isPrimary: z.boolean().default(false),
});

const liaisonSchema = z.object({
  volunteerName: z.string().trim().min(1, "Volunteer name is required"),
  volunteerEmail: z.preprocess(
    emptyToNull,
    z.string().trim().email("Enter a valid email").nullable()
  ),
  isPrimary: z.boolean().default(false),
});

const sponsorSchema = z.object({
  name: z.string().trim().min(1, "Sponsor name is required"),
  pledgedAmount: z.coerce
    .number()
    .positive("Pledged amount must be greater than zero"),
  notes: z.preprocess(emptyToNull, z.string().trim().nullable()),
  sponsorshipStartDate: z.preprocess(emptyToNull, z.string().nullable()),
  xeroContactId: z.preprocess(emptyToNull, z.string().trim().nullable()),
  doNotContact: z.boolean().default(false),
  doNotContactReason: z.preprocess(emptyToNull, z.string().trim().nullable()),
  socials: z.array(socialSchema).default([]),
  contacts: z.array(contactSchema).default([]),
  liaisons: z.array(liaisonSchema).default([]),
});

export type SponsorFormInput = {
  name: string;
  pledgedAmount: string;
  notes: string;
  sponsorshipStartDate: string;
  xeroContactId: string;
  doNotContact: boolean;
  doNotContactReason: string;
  socials: { platform: string; handle: string }[];
  contacts: {
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }[];
  liaisons: { volunteerName: string; volunteerEmail: string; isPrimary: boolean }[];
};

export async function createSponsor(input: SponsorFormInput) {
  await requireSession();
  const parsed = sponsorSchema.parse(input);

  const sponsor = await createSponsorDb({
    name: parsed.name,
    pledgedAmount: parsed.pledgedAmount.toString(),
    notes: parsed.notes,
    sponsorshipStartDate: parsed.sponsorshipStartDate,
    xeroContactId: parsed.xeroContactId,
    doNotContact: parsed.doNotContact,
    doNotContactReason: parsed.doNotContactReason,
    socials: parsed.socials,
    contacts: parsed.contacts,
    liaisons: parsed.liaisons,
  });

  revalidatePath("/sponsors");
  return sponsor;
}

export async function updateSponsor(sponsorId: string, input: SponsorFormInput) {
  await requireSession();
  const parsed = sponsorSchema.parse(input);

  const result = await updateSponsorDb(sponsorId, {
    name: parsed.name,
    pledgedAmount: parsed.pledgedAmount.toString(),
    notes: parsed.notes,
    sponsorshipStartDate: parsed.sponsorshipStartDate,
    xeroContactId: parsed.xeroContactId,
    doNotContact: parsed.doNotContact,
    doNotContactReason: parsed.doNotContactReason,
    socials: parsed.socials,
    contacts: parsed.contacts,
    liaisons: parsed.liaisons,
  });

  revalidatePath("/sponsors");
  revalidatePath(`/sponsors/${sponsorId}`);
  return result;
}

export async function deleteSponsor(sponsorId: string) {
  await requireSession();
  await deleteSponsorDb(sponsorId);
  revalidatePath("/sponsors");
}

const setStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
  regenerateDeliverables: z.boolean().default(false),
});

export async function setSponsorStatus(
  sponsorId: string,
  input: { status: "active" | "inactive"; regenerateDeliverables?: boolean }
) {
  await requireSession();
  const parsed = setStatusSchema.parse(input);

  await setSponsorStatusDb(sponsorId, parsed.status, {
    regenerateDeliverables: parsed.regenerateDeliverables,
  });

  revalidatePath("/sponsors");
  revalidatePath(`/sponsors/${sponsorId}`);
}
