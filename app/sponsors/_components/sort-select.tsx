"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPONSOR_SORT_OPTIONS, sponsorsListHref, type SponsorSort } from "@/lib/sponsor-sort";

export function SortSelect({
  sort,
  includeInactive,
}: {
  sort: SponsorSort;
  includeInactive: boolean;
}) {
  const router = useRouter();

  return (
    <Select
      value={sort}
      onValueChange={(next) => {
        router.push(sponsorsListHref({ includeInactive, sort: next as SponsorSort }));
      }}
    >
      <SelectTrigger size="sm" className="w-[230px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SPONSOR_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
