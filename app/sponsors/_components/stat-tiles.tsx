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
    <div className="flex flex-1 flex-col gap-0.5 px-4 py-3">
      <span className={cn("text-2xl font-semibold tabular-nums", valueClassName)}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function SponsorStatTiles({
  totalSponsors,
  totalPledged,
  overdueCount,
}: {
  totalSponsors: number;
  totalPledged: string;
  overdueCount: number;
}) {
  return (
    <div className="flex divide-x divide-border rounded-md border">
      <StatTile label="Sponsors" value={String(totalSponsors)} />
      <StatTile label="Pledged" value={totalPledged} />
      <StatTile
        label="Overdue"
        value={String(overdueCount)}
        valueClassName="text-red-600"
      />
    </div>
  );
}
