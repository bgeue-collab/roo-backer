"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  completeDeliverable as completeDeliverableDb,
  updateDeliverableDueDate,
} from "@/lib/db/deliverables";

export async function completeDeliverable(deliverableId: string, sponsorId: string) {
  const session = await requireSession();
  await completeDeliverableDb(deliverableId, session.user!.email!);
  revalidatePath(`/sponsors/${sponsorId}`);
  revalidatePath("/sponsors/actions");
}

export async function updateDueDate(
  deliverableId: string,
  sponsorId: string,
  newDueDate: string
) {
  const session = await requireSession();
  await updateDeliverableDueDate(deliverableId, newDueDate, session.user!.email!);
  revalidatePath(`/sponsors/${sponsorId}`);
  revalidatePath("/sponsors/actions");
}
