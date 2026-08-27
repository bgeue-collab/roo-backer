export const SPONSOR_SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "tier", label: "Tier (Platinum to Bronze)" },
  { value: "pledged", label: "Pledged amount (highest first)" },
  { value: "dateAdded", label: "Date added (newest first)" },
] as const;

export type SponsorSort = (typeof SPONSOR_SORT_OPTIONS)[number]["value"];

const DEFAULT_SORT: SponsorSort = "name";

export function parseSponsorSort(value: string | undefined): SponsorSort {
  return SPONSOR_SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SponsorSort)
    : DEFAULT_SORT;
}

/** Builds the sponsors list URL for a given list-control state, omitting params at their default. */
export function sponsorsListHref({
  includeInactive,
  sort,
}: {
  includeInactive: boolean;
  sort: SponsorSort;
}): string {
  const params = new URLSearchParams();
  if (includeInactive) params.set("showInactive", "1");
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/sponsors?${qs}` : "/sponsors";
}

type SortableSponsor = {
  name: string;
  tierSortOrder: number;
  pledgedAmount: string;
  createdAt: Date | string;
  doNotContact: boolean;
};

const COMPARATORS: Record<SponsorSort, (a: SortableSponsor, b: SortableSponsor) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  tier: (a, b) => b.tierSortOrder - a.tierSortOrder,
  pledged: (a, b) => Number(b.pledgedAmount) - Number(a.pledgedAmount),
  dateAdded: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
};

/**
 * Applies the chosen sort, with sponsors flagged doNotContact always pushed
 * to the bottom regardless of which primary sort is active — a rule layered
 * under the sort, not a sort option of its own.
 */
export function sortSponsors<T extends SortableSponsor>(list: T[], sort: SponsorSort): T[] {
  const primary = COMPARATORS[sort];
  return [...list].sort((a, b) => {
    if (a.doNotContact !== b.doNotContact) {
      return a.doNotContact ? 1 : -1;
    }
    return primary(a, b);
  });
}
