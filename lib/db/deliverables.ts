import { addDays, formatISO, startOfDay } from "date-fns";
import { and, asc, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { deliverables, sponsors, activityLog } from "@/db/schema";

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
