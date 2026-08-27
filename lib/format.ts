export function formatMoney(
  amount: number | string,
  currency = "AUD",
  { wholeDollar = false }: { wholeDollar?: boolean } = {}
) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: wholeDollar ? 0 : undefined,
    maximumFractionDigits: wholeDollar ? 0 : undefined,
  }).format(Number(amount));
}

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
