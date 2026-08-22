import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSponsorById } from "@/lib/db/sponsors";
import { getPaymentsForSponsor } from "@/lib/db/payments";
import { getOrgSettings } from "@/lib/db/org-settings";
import { formatDate, formatMoney } from "@/lib/format";
import { EditSponsorDialog } from "./_components/edit-sponsor-dialog";
import { DeleteSponsorButton } from "./_components/delete-sponsor-button";
import { LogPaymentDialog } from "./_components/log-payment-dialog";
import { DraftEmailButton } from "./_components/draft-email-button";
import { DeliverablesPanel } from "./_components/deliverables-panel";

export default async function SponsorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sponsor = await getSponsorById(id);
  if (!sponsor) notFound();

  const [payments, orgSettings] = await Promise.all([
    getPaymentsForSponsor(id),
    getOrgSettings(),
  ]);

  const currencies = new Set(payments.map((p) => p.currency));
  const receivedSummary =
    payments.length === 0
      ? { type: "none" as const }
      : currencies.size === 1
        ? {
            type: "single" as const,
            currency: payments[0].currency,
            total: payments.reduce((sum, p) => sum + Number(p.amount), 0),
          }
        : { type: "mixed" as const };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{sponsor.name}</h1>
          <Badge variant="secondary" className="w-fit">
            {sponsor.tierName}
          </Badge>
        </div>
        <div className="flex gap-2">
          <EditSponsorDialog
            sponsorId={sponsor.id}
            initialValues={{
              name: sponsor.name,
              contactName: sponsor.contactName ?? "",
              contactEmail: sponsor.contactEmail ?? "",
              contactPhone: sponsor.contactPhone ?? "",
              pledgedAmount: sponsor.pledgedAmount,
              notes: sponsor.notes ?? "",
              socials: sponsor.socials.map((s) => ({
                platform: s.platform,
                handle: s.handle,
              })),
            }}
          />
          <DeleteSponsorButton sponsorId={sponsor.id} sponsorName={sponsor.name} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Contact</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          {sponsor.contactName ? <span>{sponsor.contactName}</span> : null}
          {sponsor.contactEmail ? <span>{sponsor.contactEmail}</span> : null}
          {sponsor.contactPhone ? <span>{sponsor.contactPhone}</span> : null}
          {!sponsor.contactName && !sponsor.contactEmail && !sponsor.contactPhone ? (
            <span className="text-muted-foreground">No contact details on file.</span>
          ) : null}
          {sponsor.notes ? (
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
              {sponsor.notes}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pledged vs received</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <span>Pledged: {formatMoney(sponsor.pledgedAmount)}</span>
          {receivedSummary.type === "single" ? (
            <span>
              Received: {formatMoney(receivedSummary.total, receivedSummary.currency)}
            </span>
          ) : receivedSummary.type === "mixed" ? (
            <span className="text-muted-foreground">
              Received across multiple currencies — see payments below for each amount.
            </span>
          ) : (
            <span className="text-muted-foreground">No payments logged yet.</span>
          )}
        </CardContent>
      </Card>

      {sponsor.socials.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Social handles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {sponsor.socials.map((social) => (
              <span key={social.id}>
                {social.platform}: {social.handle}
              </span>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <DraftEmailButton
        sponsorName={sponsor.name}
        contactEmail={sponsor.contactEmail}
        tierName={sponsor.tierName}
        orgName={orgSettings?.orgName ?? "RooBacker"}
        deliverables={sponsor.deliverables}
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Deliverables</h2>
        <DeliverablesPanel deliverables={sponsor.deliverables} sponsorId={sponsor.id} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Payments</h2>
          <LogPaymentDialog sponsorId={sponsor.id} />
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments logged yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <span>{formatDate(payment.paidDate)}</span>
                <span>{formatMoney(payment.amount, payment.currency)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
