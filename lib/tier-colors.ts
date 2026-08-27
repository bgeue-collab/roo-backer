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
    return "border-yellow-400 bg-yellow-50 text-yellow-900";
  }
  if (key.includes("silver")) {
    return "border-teal-300 bg-teal-50 text-teal-800";
  }
  if (key.includes("bronze")) {
    return "border-orange-300 bg-orange-50 text-orange-800";
  }
  if (key.includes("basic")) {
    return "border-gray-300 bg-gray-100 text-gray-700";
  }
  return "border-border bg-muted text-muted-foreground";
}