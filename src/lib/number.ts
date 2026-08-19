// Chart tooltips: up to 2 decimals, optional $ prefix.
export function formatChartValue(value: unknown, usd = false): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const formatted = n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return usd ? `$${formatted}` : formatted;
}
