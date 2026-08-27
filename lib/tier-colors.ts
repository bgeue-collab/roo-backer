type TierColors = { border: string; bg: string; text: string };

const TIER_COLORS: { match: string; colors: TierColors }[] = [
  { match: "platinum", colors: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700" } },
  { match: "gold", colors: { border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-900" } },
  { match: "silver", colors: { border: "border-teal-300", bg: "bg-teal-50", text: "text-teal-800" } },
  { match: "bronze", colors: { border: "border-orange-300", bg: "bg-orange-50", text: "text-orange-800" } },
  { match: "basic", colors: { border: "border-gray-300", bg: "bg-gray-100", text: "text-gray-700" } },
];

const FALLBACK_COLORS: TierColors = {
  border: "border-border",
  bg: "bg-muted",
  text: "text-muted-foreground",
};

function resolveTierColors(tierName: string): TierColors {
  const key = tierName.trim().toLowerCase();
  return TIER_COLORS.find((entry) => key.includes(entry.match))?.colors ?? FALLBACK_COLORS;
}

/** Colour-codes tier badges, with a neutral fallback for custom tier names. */
export function tierBadgeClasses(tierName: string): string {
  const { border, bg, text } = resolveTierColors(tierName);
  return `${border} ${bg} ${text}`;
}

/** Just the text colour — for plain coloured text, not a badge/pill. */
export function tierTextClass(tierName: string): string {
  return resolveTierColors(tierName).text;
}
