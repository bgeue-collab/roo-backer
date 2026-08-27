import { addDays, addYears, formatISO, startOfDay } from "date-fns";
import { and, asc, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { deliverables, sponsors, activityLog } from "@/db/schema";

export const RENEWAL_FOLLOW_UP_TITLE = "Renewal follow-up";
export const RENEWAL_FOLLOW_UP_DESCRIPTION =
  "Check in with sponsor about renewing for another year";

function todayISODate() {
  return formatISO(startOfDay(new Date()), { representation: "date" });
}

export async function completeDeliverable(
  deliverableId: string,
  completedBy: string
) {
  const [deliverable] = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.id, deliverableId))
    .limit(1);

  if (!deliverable) {
    throw new Error("Deliverable not found");
  }

  await db
    .update(deliverables)
    .set({ completed: true, completedAt: new Date(), completedBy })
    .where(eq(deliverables.id, deliverableId));

  await db.insert(activityLog).values({
    deliverableId,
    sponsorId: deliverable.sponsorId,
    action: "deliverable_completed",
    performedBy: completedBy,
  });

  // The renewal follow-up is a recurring reminder: completing one year's
  // instance creates next year's, indefinitely. It never touches the
  // sponsor's tier, pledge, or other deliverables — renewal outcomes are
  // handled manually via the edit-sponsor flow. Inactive sponsors don't get
  // new deliverables auto-generated at all, and doNotContact sponsors
  // shouldn't get a reminder whose whole purpose is prompting a conversation
  // with them — skip the recurrence for either.
  if (deliverable.title === RENEWAL_FOLLOW_UP_TITLE) {
    const [sponsor] = await db
      .select({ status: sponsors.status, doNotContact: sponsors.doNotContact })
      .from(sponsors)
      .where(eq(sponsors.id, deliverable.sponsorId))
      .limit(1);

    if (sponsor?.status === "active" && !sponsor.doNotContact) {
      await db.insert(deliverables).values({
        sponsorId: deliverable.sponsorId,
        title: RENEWAL_FOLLOW_UP_TITLE,
        description: RENEWAL_FOLLOW_UP_DESCRIPTION,
        dueDate: formatISO(addYears(new Date(deliverable.dueDate), 1), {
          representation: "date",
        }),
      });
    }
  }
}

export async function updateDeliverableDueDate(
  deliverableId: string,
  newDueDate: string,
  performedBy: string
) {
  const [deliverable] = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.id, deliverableId))
    .limit(1);

  if (!deliverable) {
    throw new Error("Deliverable not found");
  }

  await db
    .update(deliverables)
    .set({ dueDate: newDueDate, dueDateOverridden: true })
    .where(eq(deliverables.id, deliverableId));

  await db.insert(activityLog).values({
    deliverableId,
    sponsorId: deliverable.sponsorId,
    action: "due_date_changed",
    performedBy,
    notes: `Due date changed from ${deliverable.dueDate} to ${newDueDate}`,
  });
}

/**
 * Overdue or due within 14 days, across all sponsors, sorted soonest first.
 */
export async function getActionItems() {
  const cutoff = formatISO(addDays(startOfDay(new Date()), 14), {
    representation: "date",
  });

  const rows = await db
    .select({
      id: deliverables.id,
      title: deliverables.title,
      dueDate: deliverables.dueDate,
      sponsorId: sponsors.id,
      sponsorName: sponsors.name,
    })
    .from(deliverables)
    .innerJoin(sponsors, eq(deliverables.sponsorId, sponsors.id))
    .where(and(eq(deliverables.completed, false), lte(deliverables.dueDate, cutoff)))
    .orderBy(asc(deliverables.dueDate));

  const today = todayISODate();

  return rows.map((row) => ({
    ...row,
    status: row.dueDate < today ? ("overdue" as const) : ("upcoming" as const),
  }));
}
