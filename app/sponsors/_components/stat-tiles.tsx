import { cn } from "@/lib/utils";

function StatTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-0.5 rounded-md border px-3 py-2.5 sm:px-4 sm:py-3">
      <span
        className={cn(
          "truncate text-xl font-semibold tabular-nums sm:text-2xl",
          valueClassName
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function PledgedStatTile({
  thisYear,
  lifetime,
}: {
  thisYear: string;
  lifetime: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-1.5 rounded-md border px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-lg font-semibold tabular-nums sm:text-xl">
          {thisYear}
        </span>
        <span className="text-xs text-muted-foreground">This Year</span>
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-lg font-semibold tabular-nums sm:text-xl">
          {lifetime}
        </span>
        <span className="text-xs text-muted-foreground">Lifetime</span>
      </div>
    </div>
  );
}

export function SponsorStatTiles({
  totalSponsors,
  pledgedThisYear,
  pledgedLifetime,
  totalOutstanding,
  overdueCount,
}: {
  totalSponsors: number;
  pledgedThisYear: string;
  pledgedLifetime: string;
  totalOutstanding: string;
  overdueCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <StatTile label="Sponsors" value={String(totalSponsors)} />
      <PledgedStatTile thisYear={pledgedThisYear} lifetime={pledgedLifetime} />
      <StatTile label="Outstanding" value={totalOutstanding} />
      <StatTile
        label="Overdue"
        value={String(overdueCount)}
        valueClassName="text-red-600"
      />
    </div>
  );
}
