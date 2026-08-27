"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { emptyToNull } from "@/lib/form-utils";
import * as tiersDb from "@/lib/db/tiers";

const tierSchema = z.object({
  name: z.string().trim().min(1, "Tier name is required"),
  minAmount: z.coerce.number().nonnegative("Minimum amount can't be negative"),
  sortOrder: z.coerce.number().int(),
});

export type TierFormInput = z.infer<typeof tierSchema>;

export async function createTier(input: TierFormInput) {
  await requireSession();
  const parsed = tierSchema.parse(input);

  const tier = await tiersDb.createTier({
    name: parsed.name,
    minAmount: parsed.minAmount.toString(),
    sortOrder: parsed.sortOrder,
  });

  revalidatePath("/sponsors/settings");
  return tier;
}

export async function updateTier(tierId: string, input: TierFormInput) {
  await requireSession();
  const parsed = tierSchema.parse(input);

  const tier = await tiersDb.updateTier(tierId, {
    name: parsed.name,
    minAmount: parsed.minAmount.toString(),
    sortOrder: parsed.sortOrder,
  });

  revalidatePath("/sponsors/settings");
  return tier;
}

export async function deleteTier(tierId: string) {
  await requireSession();
  // Throws a friendly error if sponsors are still assigned to this tier.
  await tiersDb.deleteTier(tierId);
  revalidatePath("/sponsors/settings");
}

const templateSchema = z.object({
  id: z.string().uuid().optional(),
  tierId: z.string().uuid().nullable(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.preprocess(emptyToNull, z.string().trim().nullable()),
  weeksFromStart: z.coerce.number().int().nonnegative("Weeks can't be negative"),
});

export type DeliverableTemplateFormInput = z.infer<typeof templateSchema>;

export async function upsertDeliverableTemplate(
  input: DeliverableTemplateFormInput
) {
  await requireSession();
  const parsed = templateSchema.parse(input);

  const template = await tiersDb.upsertDeliverableTemplate(parsed);

  revalidatePath("/sponsors/settings");
  return template;
}

export async function deleteDeliverableTemplate(templateId: string) {
  await requireSession();
  await tiersDb.deleteDeliverableTemplate(templateId);
  revalidatePath("/sponsors/settings");
}
