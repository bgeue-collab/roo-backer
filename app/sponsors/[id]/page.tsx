import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSponsorById,
  getDistinctLiaisonVolunteerNames,
} from "@/lib/db/sponsors";
import { getPaymentsForSponsor } from "@/lib/db/payments";
import { getOrgSettings } from "@/lib/db/org-settings";
import { formatDate, formatMoney } from "@/lib/format";
import { getSocialHandleUrl } from "@/lib/socials";
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

  const [payments, orgSettings, volunteerNameSuggestions] = await Promise.all([
    getPaymentsForSponsor(id),
    getOrgSettings(),
    getDistinctLiaisonVolunteerNames(),
  ]);

  const primaryContact = sponsor.contacts.find((c) => c.isPrimary) ?? null;

  const cashPayments = payments.filter((p) => p.paymentType !== "in_kind");
  const currencies = new Set(cashPayments.map((p) => p.currency));
  const receivedSummary =
    cashPayments.length === 0
      ? { type: "none" as const }
      : currencies.size === 1
        ? {
            type: "single" as const,
            currency: cashPayments[0].currency,
            total: cashPayments.reduce((sum, p) => sum + Number(p.amount), 0),
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
            volunteerNameSuggestions={volunteerNameSuggestions}
            initialValues={{
              name: sponsor.name,
              pledgedAmount: sponsor.pledgedAmount,
              notes: sponsor.notes ?? "",
              sponsorshipStartDate: sponsor.sponsorshipStartDate ?? "",
              xeroContactId: sponsor.xeroContactId ?? "",
              socials: sponsor.socials.map((s) => ({
                platform: s.platform,
                handle: s.handle,
              })),
              contacts: sponsor.contacts.map((c) => ({
                name: c.name,
                role: c.role ?? "",
                email: c.email ?? "",
                phone: c.phone ?? "",
                isPrimary: c.isPrimary,
              })),
              liaisons: sponsor.liaisons.map((l) => ({
                volunteerName: l.volunteerName,
                volunteerEmail: l.volunteerEmail ?? "",
                isPrimary: l.isPrimary,
              })),
            }}
          />
          <DeleteSponsorButton sponsorId={sponsor.id} sponsorName={sponsor.name} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Contacts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {sponsor.contacts.length === 0 ? (
            <span className="text-muted-foreground">No contact details on file.</span>
          ) : (
            sponsor.contacts.map((contact) => (
              <div key={contact.id} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{contact.name}</span>
                  {contact.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
                </div>
                {contact.role ? (
                  <span className="text-muted-foreground">{contact.role}</span>
                ) : null}
                {contact.email ? <span>{contact.email}</span> : null}
                {contact.phone ? <span>{contact.phone}</span> : null}
              </div>
            ))
          )}
          {sponsor.notes ? (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {sponsor.notes}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {sponsor.liaisons.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Internal liaison</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {sponsor.liaisons.map((liaison) => (
              <div key={liaison.id} className="flex items-center gap-2">
                <span className="font-medium">{liaison.volunteerName}</span>
                {liaison.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
                {liaison.volunteerEmail ? (
                  <span className="text-muted-foreground">{liaison.volunteerEmail}</span>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pledged vs received</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <span>Pledged: {formatMoney(sponsor.pledgedAmount)}</span>
          {receivedSummary.type === "single" ? (
            <span>
              Received (cash): {formatMoney(receivedSummary.total, receivedSummary.currency)}
            </span>
          ) : receivedSummary.type === "mixed" ? (
            <span className="text-muted-foreground">
              Received across multiple currencies — see payments below for each amount.
            </span>
          ) : (
            <span className="text-muted-foreground">No cash payments logged yet.</span>
          )}
          {sponsor.sponsorshipStartDate ? (
            <span className="text-muted-foreground">
              Sponsorship start: {formatDate(sponsor.sponsorshipStartDate)}
            </span>
          ) : null}
        </CardContent>
      </Card>

      {sponsor.xeroContactId ? (
        <Button variant="outline" className="w-fit" asChild>
          <a
            href={`https://go.xero.com/Contacts/View/${sponsor.xeroContactId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Xero
          </a>
        </Button>
      ) : null}

      {sponsor.socials.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Social handles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {sponsor.socials.map((social) => {
              const url = getSocialHandleUrl(social.platform, social.handle);
              return url ? (
                <a
                  key={social.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-primary underline underline-offset-2 hover:no-underline"
                >
                  {social.platform}: {social.handle}
                </a>
              ) : (
                <span key={social.id}>
                  {social.platform}: {social.handle}
                </span>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <DraftEmailButton
        sponsorName={sponsor.name}
        contactEmail={primaryContact?.email ?? null}
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
                className="flex flex-col gap-1 rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span>{formatDate(payment.paidDate)}</span>
                  <div className="flex items-center gap-2">
                    {payment.paymentType === "in_kind" ? (
                      <Badge variant="outline">In-kind</Badge>
                    ) : null}
                    <span>{formatMoney(payment.amount, payment.currency)}</span>
                  </div>
                </div>
                {payment.paymentType === "in_kind" && payment.description ? (
                  <span className="text-muted-foreground">{payment.description}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
