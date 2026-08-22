import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sponsorTiers, tierDeliverableTemplates, sponsors } from "@/db/schema";

export async function getTiers() {
  const tiers = await db
    .select()
    .from(sponsorTiers)
    .orderBy(asc(sponsorTiers.sortOrder));

  const templates = await db
    .select()
    .from(tierDeliverableTemplates)
    .orderBy(asc(tierDeliverableTemplates.weeksFromStart));

  return tiers.map((tier) => ({
    ...tier,
    templates: templates.filter((template) => template.tierId === tier.id),
  }));
}

export async function getTierById(tierId: string) {
  const [tier] = await db
    .select()
    .from(sponsorTiers)
    .where(eq(sponsorTiers.id, tierId))
    .limit(1);
  return tier ?? null;
}

/**
 * Highest tier whose minAmount is met by the pledged amount. Returns null if
 * the pledge doesn't reach even the lowest tier's threshold.
 */
export async function getTierForAmount(pledgedAmount: number) {
  const tiers = await db
    .select()
    .from(sponsorTiers)
    .orderBy(asc(sponsorTiers.sortOrder));

  let match = null;
  for (const tier of tiers) {
    if (pledgedAmount >= Number(tier.minAmount)) {
      match = tier;
    }
  }
  return match;
}

export async function createTier(data: {
  name: string;
  minAmount: string;
  sortOrder: number;
}) {
  const [tier] = await db.insert(sponsorTiers).values(data).returning();
  return tier;
}

export async function updateTier(
  tierId: string,
  data: Partial<{ name: string; minAmount: string; sortOrder: number }>
) {
  const [tier] = await db
    .update(sponsorTiers)
    .set(data)
    .where(eq(sponsorTiers.id, tierId))
    .returning();
  return tier;
}

/**
 * Throws with a friendly message if the tier still has sponsors assigned,
 * rather than relying solely on the DB's ON DELETE RESTRICT to surface a raw
 * constraint error.
 */
export async function deleteTier(tierId: string) {
  const assignedSponsors = await db
    .select({ id: sponsors.id })
    .from(sponsors)
    .where(eq(sponsors.tierId, tierId))
    .limit(1);

  if (assignedSponsors.length > 0) {
    throw new Error(
      "This tier has sponsors assigned to it. Reassign or remove those sponsors before deleting the tier."
    );
  }

  await db.delete(sponsorTiers).where(eq(sponsorTiers.id, tierId));
}

export async function upsertDeliverableTemplate(data: {
  id?: string;
  tierId: string;
  title: string;
  description: string | null;
  weeksFromStart: number;
}) {
  if (data.id) {
    const [template] = await db
      .update(tierDeliverableTemplates)
      .set({
        title: data.title,
        description: data.description,
        weeksFromStart: data.weeksFromStart,
      })
      .where(eq(tierDeliverableTemplates.id, data.id))
      .returning();
    return template;
  }

  const [template] = await db
    .insert(tierDeliverableTemplates)
    .values({
      tierId: data.tierId,
      title: data.title,
      description: data.description,
      weeksFromStart: data.weeksFromStart,
    })
    .returning();
  return template;
}

export async function deleteDeliverableTemplate(templateId: string) {
  await db
    .delete(tierDeliverableTemplates)
    .where(eq(tierDeliverableTemplates.id, templateId));
}
