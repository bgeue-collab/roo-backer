import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSponsors, getDistinctLiaisonVolunteerNames } from "@/lib/db/sponsors";
import { formatMoney } from "@/lib/format";
import { tierBadgeClasses } from "@/lib/tier-colors";
import { parseSponsorSort, sponsorsListHref, sortSponsors } from "@/lib/sponsor-sort";
import { AddSponsorDialog } from "./_components/add-sponsor-dialog";
import { SponsorStatTiles } from "./_components/stat-tiles";
import { SortSelect } from "./_components/sort-select";

export default async function SponsorsPage({
  searchParams,
}: {
  searchParams: Promise<{ showInactive?: string; sort?: string }>;
}) {
  const { showInactive, sort: sortParam } = await searchParams;
  const includeInactive = showInactive === "1";
  const sort = parseSponsorSort(sortParam);

  const [allSponsors, volunteerNameSuggestions] = await Promise.all([
    getSponsors(),
    getDistinctLiaisonVolunteerNames(),
  ]);

  const activeSponsors = allSponsors.filter((s) => s.status === "active");
  const visibleSponsors = sortSponsors(
    includeInactive ? allSponsors : activeSponsors,
    sort
  );

  // Dashboard stats always reflect active sponsors only, regardless of the
  // "show inactive" list toggle.
  const pledgedLifetime = activeSponsors.reduce(
    (sum, sponsor) => sum + Number(sponsor.pledgedAmount),
    0
  );
  const currentYear = new Date().getFullYear();
  const pledgedThisYear = activeSponsors.reduce((sum, sponsor) => {
    if (!sponsor.sponsorshipStartDate) return sum;
    const startYear = Number(sponsor.sponsorshipStartDate.slice(0, 4));
    return startYear === currentYear ? sum + Number(sponsor.pledgedAmount) : sum;
  }, 0);
  const overdueCount = activeSponsors.reduce(
    (sum, sponsor) => sum + sponsor.overdueCount,
    0
  );
  const totalOutstanding = activeSponsors.reduce(
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
        totalSponsors={activeSponsors.length}
        pledgedThisYear={formatMoney(pledgedThisYear, "AUD", { wholeDollar: true })}
        pledgedLifetime={formatMoney(pledgedLifetime, "AUD", { wholeDollar: true })}
        totalOutstanding={formatMoney(totalOutstanding, "AUD", { wholeDollar: true })}
        overdueCount={overdueCount}
      />

      <div className="flex items-center justify-between gap-2">
        <SortSelect sort={sort} includeInactive={includeInactive} />
        <Button variant="outline" size="sm" asChild>
          <Link href={sponsorsListHref({ includeInactive: !includeInactive, sort })}>
            {includeInactive ? "Hide inactive" : "Show inactive"}
          </Link>
        </Button>
      </div>

      {visibleSponsors.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sponsors yet. Add your first sponsor to get started.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-md border">
          {visibleSponsors.map((sponsor) => (
            <Link
              key={sponsor.id}
              href={`/sponsors/${sponsor.id}`}
              className={
                sponsor.status === "inactive"
                  ? "flex items-center justify-between gap-3 px-4 py-2.5 opacity-60 hover:bg-muted/40"
                  : "flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40"
              }
            >
              <span className="truncate font-medium">{sponsor.name}</span>
              <div className="flex shrink-0 items-center gap-2">
                {sponsor.doNotContact ? (
                  <Badge variant="destructive">DNC</Badge>
                ) : null}
                {sponsor.status === "inactive" ? (
                  <Badge
                    variant="outline"
                    className="border-border bg-muted text-muted-foreground"
                  >
                    Inactive
                  </Badge>
                ) : null}
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
