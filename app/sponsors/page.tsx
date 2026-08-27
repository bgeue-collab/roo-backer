import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getSponsors, getDistinctLiaisonVolunteerNames } from "@/lib/db/sponsors";
import { formatMoney } from "@/lib/format";
import { tierBadgeClasses } from "@/lib/tier-colors";
import { AddSponsorDialog } from "./_components/add-sponsor-dialog";
import { SponsorStatTiles } from "./_components/stat-tiles";

export default async function SponsorsPage() {
  const [sponsors, volunteerNameSuggestions] = await Promise.all([
    getSponsors(),
    getDistinctLiaisonVolunteerNames(),
  ]);

  const totalPledged = sponsors.reduce(
    (sum, sponsor) => sum + Number(sponsor.pledgedAmount),
    0
  );
  const overdueCount = sponsors.reduce(
    (sum, sponsor) => sum + sponsor.overdueCount,
    0
  );
  const totalOutstanding = sponsors.reduce(
    (sum, sponsor) =>
      sponsor.outstandingAmount > 0 ? sum + sponsor.outstandingAmount : sum,
    0
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sponsors</h1>
        <AddSponsorDialog volunteerNameSuggestions={volunteerNameSuggestions} />
      </div>

      <SponsorStatTiles
        totalSponsors={sponsors.length}
        totalPledged={formatMoney(totalPledged, "AUD", { wholeDollar: true })}
        totalOutstanding={formatMoney(totalOutstanding, "AUD", { wholeDollar: true })}
        overdueCount={overdueCount}
      />

      {sponsors.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sponsors yet. Add your first sponsor to get started.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-md border">
          {sponsors.map((sponsor) => (
            <Link
              key={sponsor.id}
              href={`/sponsors/${sponsor.id}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40"
            >
              <span className="truncate font-medium">{sponsor.name}</span>
              <div className="flex shrink-0 items-center gap-3">
                {sponsor.isPaidUp ? (
                  <Badge
                    variant="outline"
                    className="border-green-300 bg-green-50 text-green-700"
                  >
                    Paid up
                  </Badge>
                ) : null}
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatMoney(sponsor.pledgedAmount)}
                </span>
                <Badge
                  variant="outline"
                  className={tierBadgeClasses(sponsor.tierName)}
                >
                  {sponsor.tierName}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
