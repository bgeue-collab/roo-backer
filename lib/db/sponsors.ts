import { addWeeks, addYears, formatISO, startOfDay } from "date-fns";
import { asc, desc, eq, and, or, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  sponsors,
  sponsorTiers,
  sponsorSocials,
  sponsorContacts,
  sponsorLiaisons,
  deliverables,
  tierDeliverableTemplates,
  payments,
} from "@/db/schema";
import { getTierForAmount } from "@/lib/db/tiers";
import {
  RENEWAL_FOLLOW_UP_TITLE,
  RENEWAL_FOLLOW_UP_DESCRIPTION,
} from "@/lib/db/deliverables";

export type SocialInput = { platform: string; handle: string };

export type ContactInput = {
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
};

export type LiaisonInput = {
  volunteerName: string;
  volunteerEmail: string | null;
  isPrimary: boolean;
};

export type SponsorInput = {
  name: string;
  pledgedAmount: string;
  notes: string | null;
  sponsorshipStartDate: string | null;
  xeroContactId: string | null;
  socials: SocialInput[];
  contacts: ContactInput[];
  liaisons: LiaisonInput[];
};

function todayISODate() {
  return formatISO(startOfDay(new Date()), { representation: "date" });
}

/** Enforce only one isPrimary=true row: last primary in the list wins. */
function withSinglePrimary<T extends { isPrimary: boolean }>(rows: T[]): T[] {
  const lastPrimaryIndex = rows.map((r) => r.isPrimary).lastIndexOf(true);
  return rows.map((row, i) => ({ ...row, isPrimary: i === lastPrimaryIndex }));
}

export async function getSponsors() {
  const rows = await db
    .select({
      id: sponsors.id,
      name: sponsors.name,
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

  // Every payment (cash or in-kind, any currency) counts toward what's paid —
  // this treats payments.amount as its AUD-equivalent value regardless.
  const paymentTotals = await db
    .select({
      sponsorId: payments.sponsorId,
      total: sql<string>`sum(${payments.amount})`,
    })
    .from(payments)
    .groupBy(payments.sponsorId);

  const paidBySponsor = new Map(
    paymentTotals.map((row) => [row.sponsorId, Number(row.total)])
  );

  return rows.map((row) => {
    const pledgedAmount = Number(row.pledgedAmount);
    const totalPaid = paidBySponsor.get(row.id) ?? 0;
    return {
      ...row,
      overdueCount: overdueBySponsor.get(row.id) ?? 0,
      outstandingAmount: pledgedAmount - totalPaid,
      isPaidUp: pledgedAmount > 0 && totalPaid >= pledgedAmount,
    };
  });
}

export async function getSponsorById(sponsorId: string) {
  const [sponsor] = await db
    .select({
      id: sponsors.id,
      name: sponsors.name,
      pledgedAmount: sponsors.pledgedAmount,
      notes: sponsors.notes,
      sponsorshipStartDate: sponsors.sponsorshipStartDate,
      xeroContactId: sponsors.xeroContactId,
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

  const [socials, contacts, liaisons, sponsorDeliverables] = await Promise.all([
    db
      .select()
      .from(sponsorSocials)
      .where(eq(sponsorSocials.sponsorId, sponsorId))
      .orderBy(asc(sponsorSocials.createdAt)),
    db
      .select()
      .from(sponsorContacts)
      .where(eq(sponsorContacts.sponsorId, sponsorId))
      .orderBy(desc(sponsorContacts.isPrimary), asc(sponsorContacts.createdAt)),
    db
      .select()
      .from(sponsorLiaisons)
      .where(eq(sponsorLiaisons.sponsorId, sponsorId))
      .orderBy(desc(sponsorLiaisons.isPrimary), asc(sponsorLiaisons.createdAt)),
    db
      .select()
      .from(deliverables)
      .where(eq(deliverables.sponsorId, sponsorId))
      .orderBy(asc(deliverables.dueDate)),
  ]);

  return {
    ...sponsor,
    socials,
    contacts,
    liaisons,
    deliverables: sponsorDeliverables,
  };
}

/** Distinct volunteer names used across all sponsors, for liaison autocomplete. */
export async function getDistinctLiaisonVolunteerNames() {
  const rows = await db
    .selectDistinct({ volunteerName: sponsorLiaisons.volunteerName })
    .from(sponsorLiaisons)
    .orderBy(asc(sponsorLiaisons.volunteerName));
  return rows.map((row) => row.volunteerName);
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

async function replaceContacts(sponsorId: string, contacts: ContactInput[]) {
  await db.delete(sponsorContacts).where(eq(sponsorContacts.sponsorId, sponsorId));
  if (contacts.length > 0) {
    await db.insert(sponsorContacts).values(
      withSinglePrimary(contacts).map((contact) => ({
        sponsorId,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        isPrimary: contact.isPrimary,
      }))
    );
  }
}

async function replaceLiaisons(sponsorId: string, liaisons: LiaisonInput[]) {
  await db.delete(sponsorLiaisons).where(eq(sponsorLiaisons.sponsorId, sponsorId));
  if (liaisons.length > 0) {
    await db.insert(sponsorLiaisons).values(
      withSinglePrimary(liaisons).map((liaison) => ({
        sponsorId,
        volunteerName: liaison.volunteerName,
        volunteerEmail: liaison.volunteerEmail,
        isPrimary: liaison.isPrimary,
      }))
    );
  }
}

export async function createSponsor(data: SponsorInput) {
  const tier = await deriveTierOrThrow(data.pledgedAmount);
  const startDate = data.sponsorshipStartDate ?? todayISODate();

  const [sponsor] = await db
    .insert(sponsors)
    .values({
      name: data.name,
      pledgedAmount: data.pledgedAmount,
      tierId: tier.id,
      notes: data.notes,
      sponsorshipStartDate: startDate,
      xeroContactId: data.xeroContactId,
    })
    .returning();

  await replaceContacts(sponsor.id, data.contacts);
  await replaceLiaisons(sponsor.id, data.liaisons);

  if (data.socials.length > 0) {
    await db.insert(sponsorSocials).values(
      data.socials.map((social) => ({
        sponsorId: sponsor.id,
        platform: social.platform,
        handle: social.handle,
      }))
    );
  }

  // Pull the sponsor's tier-specific templates together with the global
  // (tierId null) ones that apply regardless of tier.
  const templates = await db
    .select()
    .from(tierDeliverableTemplates)
    .where(
      or(
        eq(tierDeliverableTemplates.tierId, tier.id),
        isNull(tierDeliverableTemplates.tierId)
      )
    );

  const today = startOfDay(new Date());
  const templateDeliverables = templates.map((template) => ({
    sponsorId: sponsor.id,
    title: template.title,
    description: template.description,
    dueDate: formatISO(addWeeks(today, template.weeksFromStart), {
      representation: "date",
    }),
  }));

  const renewalDeliverable = {
    sponsorId: sponsor.id,
    title: RENEWAL_FOLLOW_UP_TITLE,
    description: RENEWAL_FOLLOW_UP_DESCRIPTION,
    dueDate: formatISO(addYears(new Date(startDate), 1), {
      representation: "date",
    }),
  };

  await db.insert(deliverables).values([...templateDeliverables, renewalDeliverable]);

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
      pledgedAmount: data.pledgedAmount,
      tierId: tier.id,
      notes: data.notes,
      sponsorshipStartDate: data.sponsorshipStartDate,
      xeroContactId: data.xeroContactId,
      updatedAt: new Date(),
    })
    .where(eq(sponsors.id, sponsorId));

  await replaceContacts(sponsorId, data.contacts);
  await replaceLiaisons(sponsorId, data.liaisons);

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
  // Deliverables, payments, socials, contacts, liaisons, and activity_log
  // rows all cascade via their FK constraints — no need to delete them
  // explicitly here.
  await db.delete(sponsors).where(eq(sponsors.id, sponsorId));
}
