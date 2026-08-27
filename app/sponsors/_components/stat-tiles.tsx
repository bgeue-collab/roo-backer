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
    <div className="flex min-w-0 flex-col gap-0.5 rounded-md border px-3 py-2.5 sm:px-4 sm:py-3">
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

export function SponsorStatTiles({
  totalSponsors,
  totalPledged,
  totalOutstanding,
  overdueCount,
}: {
  totalSponsors: number;
  totalPledged: string;
  totalOutstanding: string;
  overdueCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <StatTile label="Sponsors" value={String(totalSponsors)} />
      <StatTile label="Pledged" value={totalPledged} />
      <StatTile label="Outstanding" value={totalOutstanding} />
      <StatTile
        label="Overdue"
        value={String(overdueCount)}
        valueClassName="text-red-600"
      />
    </div>
  );
}
