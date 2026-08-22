"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { emptyToNull } from "@/lib/form-utils";
import {
  createSponsor as createSponsorDb,
  updateSponsor as updateSponsorDb,
  deleteSponsor as deleteSponsorDb,
} from "@/lib/db/sponsors";

const socialSchema = z.object({
  platform: z.string().trim().min(1, "Platform is required"),
  handle: z.string().trim().min(1, "Handle is required"),
});

const sponsorSchema = z.object({
  name: z.string().trim().min(1, "Sponsor name is required"),
  contactName: z.preprocess(emptyToNull, z.string().trim().nullable()),
  contactEmail: z.preprocess(
    emptyToNull,
    z.string().trim().email("Enter a valid email").nullable()
  ),
  contactPhone: z.preprocess(emptyToNull, z.string().trim().nullable()),
  pledgedAmount: z.coerce
    .number()
    .positive("Pledged amount must be greater than zero"),
  notes: z.preprocess(emptyToNull, z.string().trim().nullable()),
  socials: z.array(socialSchema).default([]),
});

export type SponsorFormInput = {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pledgedAmount: string;
  notes: string;
  socials: { platform: string; handle: string }[];
};

export async function createSponsor(input: SponsorFormInput) {
  await requireSession();
  const parsed = sponsorSchema.parse(input);

  const sponsor = await createSponsorDb({
    name: parsed.name,
    contactName: parsed.contactName,
    contactEmail: parsed.contactEmail,
    contactPhone: parsed.contactPhone,
    pledgedAmount: parsed.pledgedAmount.toString(),
    notes: parsed.notes,
    socials: parsed.socials,
  });

  revalidatePath("/sponsors");
  return sponsor;
}

export async function updateSponsor(sponsorId: string, input: SponsorFormInput) {
  await requireSession();
  const parsed = sponsorSchema.parse(input);

  const result = await updateSponsorDb(sponsorId, {
    name: parsed.name,
    contactName: parsed.contactName,
    contactEmail: parsed.contactEmail,
    contactPhone: parsed.contactPhone,
    pledgedAmount: parsed.pledgedAmount.toString(),
    notes: parsed.notes,
    socials: parsed.socials,
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
