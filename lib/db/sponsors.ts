import { addWeeks, formatISO, startOfDay } from "date-fns";
import { asc, desc, eq, and, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  sponsors,
  sponsorTiers,
  sponsorSocials,
  deliverables,
  tierDeliverableTemplates,
} from "@/db/schema";
import { getTierForAmount } from "@/lib/db/tiers";

export type SocialInput = { platform: string; handle: string };

export type SponsorInput = {
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  pledgedAmount: string;
  notes: string | null;
  socials: SocialInput[];
};

function todayISODate() {
  return formatISO(startOfDay(new Date()), { representation: "date" });
}

export async function getSponsors() {
  const rows = await db
    .select({
      id: sponsors.id,
      name: sponsors.name,
      contactName: sponsors.contactName,
      pledgedAmount: sponsors.pledgedAmount,
      tierId: sponsors.tierId,
      tierName: sponsorTiers.name,
      tierSortOrder: sponsorTiers.sortOrder,
      createdAt: sponsors.createdAt,
    })
    .from(sponsors)
    .innerJoin(sponsorTiers, eq(sponsors.tierId, sponsorTiers.id))
    .orderBy(desc(sponsors.createdAt));

  const overdueCounts = await db
    .select({
      sponsorId: deliverables.sponsorId,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(deliverables)
    .where(
      and(eq(deliverables.completed, false), lt(deliverables.dueDate, todayISODate()))
    )
    .groupBy(deliverables.sponsorId);

  const overdueBySponsor = new Map(
    overdueCounts.map((row) => [row.sponsorId, row.count])
  );

  return rows.map((row) => ({
    ...row,
    overdueCount: overdueBySponsor.get(row.id) ?? 0,
  }));
}

export async function getSponsorById(sponsorId: string) {
  const [sponsor] = await db
    .select({
      id: sponsors.id,
      name: sponsors.name,
      contactName: sponsors.contactName,
      contactEmail: sponsors.contactEmail,
      contactPhone: sponsors.contactPhone,
      pledgedAmount: sponsors.pledgedAmount,
      notes: sponsors.notes,
      tierId: sponsors.tierId,
      tierName: sponsorTiers.name,
      createdAt: sponsors.createdAt,
      updatedAt: sponsors.updatedAt,
    })
    .from(sponsors)
    .innerJoin(sponsorTiers, eq(sponsors.tierId, sponsorTiers.id))
    .where(eq(sponsors.id, sponsorId))
    .limit(1);

  if (!sponsor) return null;

  const socials = await db
    .select()
    .from(sponsorSocials)
    .where(eq(sponsorSocials.sponsorId, sponsorId))
    .orderBy(asc(sponsorSocials.createdAt));

  const sponsorDeliverables = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.sponsorId, sponsorId))
    .orderBy(asc(deliverables.dueDate));

  return { ...sponsor, socials, deliverables: sponsorDeliverables };
}

async function deriveTierOrThrow(pledgedAmount: string) {
  const tier = await getTierForAmount(Number(pledgedAmount));
  if (!tier) {
    throw new Error(
      "Pledged amount doesn't meet the lowest tier's minimum. Add a lower tier or increase the pledge before saving."
    );
  }
  return tier;
}

export async function createSponsor(data: SponsorInput) {
  const tier = await deriveTierOrThrow(data.pledgedAmount);

  const [sponsor] = await db
    .insert(sponsors)
    .values({
      name: data.name,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      pledgedAmount: data.pledgedAmount,
      tierId: tier.id,
      notes: data.notes,
    })
    .returning();

  if (data.socials.length > 0) {
    await db.insert(sponsorSocials).values(
      data.socials.map((social) => ({
        sponsorId: sponsor.id,
        platform: social.platform,
        handle: social.handle,
      }))
    );
  }

  const templates = await db
    .select()
    .from(tierDeliverableTemplates)
    .where(eq(tierDeliverableTemplates.tierId, tier.id));

  if (templates.length > 0) {
    const today = startOfDay(new Date());
    await db.insert(deliverables).values(
      templates.map((template) => ({
        sponsorId: sponsor.id,
        title: template.title,
        description: template.description,
        dueDate: formatISO(addWeeks(today, template.weeksFromStart), {
          representation: "date",
        }),
      }))
    );
  }

  return sponsor;
}

export async function updateSponsor(
  sponsorId: string,
  data: SponsorInput
): Promise<{ tierChanged: boolean }> {
  const existing = await db
    .select({ tierId: sponsors.tierId })
    .from(sponsors)
    .where(eq(sponsors.id, sponsorId))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("Sponsor not found");
  }

  const tier = await deriveTierOrThrow(data.pledgedAmount);
  const tierChanged = tier.id !== existing[0].tierId;

  await db
    .update(sponsors)
    .set({
      name: data.name,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      pledgedAmount: data.pledgedAmount,
      tierId: tier.id,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(sponsors.id, sponsorId));

  await db.delete(sponsorSocials).where(eq(sponsorSocials.sponsorId, sponsorId));
  if (data.socials.length > 0) {
    await db.insert(sponsorSocials).values(
      data.socials.map((social) => ({
        sponsorId,
        platform: social.platform,
        handle: social.handle,
      }))
    );
  }

  return { tierChanged };
}

export async function deleteSponsor(sponsorId: string) {
  // Deliverables, payments, socials, and activity_log rows all cascade via
  // their FK constraints — no need to delete them explicitly here.
  await db.delete(sponsors).where(eq(sponsors.id, sponsorId));
}
