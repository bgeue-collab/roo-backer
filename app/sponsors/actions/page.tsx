import Link from "next/link";
import { cn } from "@/lib/utils";
import { getActionItems } from "@/lib/db/deliverables";
import { formatDate } from "@/lib/format";
import { tierTextClass } from "@/lib/tier-colors";

export default async function ActionsPage() {
  const items = await getActionItems();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Actions</h1>
      <p className="text-sm text-muted-foreground">
        Deliverables that are overdue or due within the next 14 days, across all
        sponsors.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing overdue or due soon. Nice work.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-md border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40"
            >
              <Link
                href={`/sponsors/${item.sponsorId}`}
                className="flex min-w-0 flex-1 items-baseline gap-2"
              >
                <span className="truncate font-medium">{item.title}</span>
                <span
                  className={cn("truncate text-sm", tierTextClass(item.tierName))}
                >
                  {item.sponsorName}
                </span>
                {item.liaisonName ? (
                  <span className="truncate text-sm text-muted-foreground">
                    · {item.liaisonName}
                  </span>
                ) : null}
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                {item.resourceUrl ? (
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline underline-offset-2 hover:no-underline"
                  >
                    View template
                  </a>
                ) : null}
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    item.status === "overdue" ? "text-red-600" : "text-amber-600"
                  )}
                >
                  {formatDate(item.dueDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
