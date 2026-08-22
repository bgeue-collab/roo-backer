/**
 * Colour-codes tier badges by matching common tier-name keywords, with a
 * neutral fallback for custom tier names the club might add later.
 */
export function tierBadgeClasses(tierName: string): string {
  const key = tierName.trim().toLowerCase();

  if (key.includes("platinum")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (key.includes("gold")) {
    return "border-yellow-300 bg-yellow-50 text-yellow-800";
  }
  if (key.includes("silver")) {
    return "border-gray-300 bg-gray-100 text-gray-700";
  }
  if (key.includes("bronze")) {
    return "border-amber-300 bg-amber-50 text-amber-800";
  }
  return "border-border bg-muted text-muted-foreground";
}
