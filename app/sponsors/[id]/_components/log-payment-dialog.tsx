"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logPayment } from "@/app/actions/payments";

type PaymentType = "cash" | "in_kind";

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function LogPaymentDialog({ sponsorId }: { sponsorId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [paidDate, setPaidDate] = useState(todayISODate());
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function reset() {
    setAmount("");
    setCurrency("AUD");
    setPaidDate(todayISODate());
    setPaymentType("cash");
    setDescription("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await logPayment({
          sponsorId,
          amount,
          currency,
          paidDate,
          paymentType,
          description,
          notes,
        });
        toast.success("Payment logged.");
        reset();
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't log payment."
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Log payment
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={paymentType === "cash" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPaymentType("cash")}
            >
              Cash
            </Button>
            <Button
              type="button"
              variant={paymentType === "in_kind" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPaymentType("in_kind")}
            >
              In-kind
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={3}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paidDate">Paid date</Label>
            <Input
              id="paidDate"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
            />
          </div>
          {paymentType === "in_kind" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">What was given</Label>
              <Input
                id="description"
                placeholder="e.g. 3D printer filament"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Log payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
