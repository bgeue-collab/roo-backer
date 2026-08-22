"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { emptyToNull } from "@/lib/form-utils";
import { createPayment as createPaymentDb } from "@/lib/db/payments";

const paymentSchema = z
  .object({
    sponsorId: z.string().uuid(),
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    currency: z.string().trim().min(1, "Currency is required").default("AUD"),
    paidDate: z.string().min(1, "Paid date is required"),
    paymentType: z.enum(["cash", "in_kind"]).default("cash"),
    description: z.preprocess(emptyToNull, z.string().trim().nullable()),
    notes: z.preprocess(emptyToNull, z.string().trim().nullable()),
  })
  .refine(
    (data) => data.paymentType !== "in_kind" || !!data.description,
    { message: "Description is required for in-kind payments", path: ["description"] }
  );

export type LogPaymentInput = {
  sponsorId: string;
  amount: string;
  currency: string;
  paidDate: string;
  paymentType: "cash" | "in_kind";
  description: string;
  notes: string;
};

export async function logPayment(input: LogPaymentInput) {
  await requireSession();
  const parsed = paymentSchema.parse(input);

  const payment = await createPaymentDb({
    sponsorId: parsed.sponsorId,
    amount: parsed.amount.toString(),
    currency: parsed.currency.toUpperCase(),
    paidDate: parsed.paidDate,
    paymentType: parsed.paymentType,
    description: parsed.paymentType === "in_kind" ? parsed.description : null,
    notes: parsed.notes,
  });

  revalidatePath(`/sponsors/${parsed.sponsorId}`);
  return payment;
}
