"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { emptyToNull } from "@/lib/form-utils";
import { updateOrgSettings as updateOrgSettingsDb } from "@/lib/db/org-settings";

const orgSettingsSchema = z.object({
  orgName: z.string().trim().min(1, "Organisation name is required"),
  orgFullName: z.string().trim().min(1, "Full organisation name is required"),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a valid hex colour"),
  logoUrl: z.preprocess(
    emptyToNull,
    z.string().trim().url("Enter a valid URL").nullable()
  ),
});

export type OrgSettingsFormInput = z.infer<typeof orgSettingsSchema>;

export async function updateOrgSettings(input: OrgSettingsFormInput) {
  await requireSession();
  const parsed = orgSettingsSchema.parse(input);

  const settings = await updateOrgSettingsDb(parsed);

  // Org name/colour/logo feed the root layout, nav header, and PWA manifest.
  revalidatePath("/", "layout");
  return settings;
}
