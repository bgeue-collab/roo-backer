import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";

export async function getPaymentsForSponsor(sponsorId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.sponsorId, sponsorId))
    .orderBy(asc(payments.paidDate));
}

export async function createPayment(data: {
  sponsorId: string;
  amount: string;
  currency: string;
  paidDate: string;
  paymentType: "cash" | "in_kind";
  description: string | null;
  notes: string | null;
}) {
  const [payment] = await db.insert(payments).values(data).returning();
  return payment;
}
