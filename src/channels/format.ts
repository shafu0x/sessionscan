import type {
  Channel,
  SessionSort,
  SortDir,
  TimeRange,
} from "@/channels/types";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const divisions: readonly [number, Intl.RelativeTimeFormatUnit][] = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [7, "day"],
  [4.34524, "week"],
  [12, "month"],
  [Number.POSITIVE_INFINITY, "year"],
];

export function formatRelativeTime(date: Date): string {
  let duration = (date.getTime() - Date.now()) / 1000;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) {
      return rtf.format(Math.round(duration), unit);
    }
    duration /= amount;
  }
  return rtf.format(Math.round(duration), "year");
}

export function truncateHex(value: string): string {
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export function formatCompact(value: number): string {
  return compactFormat.format(value);
}

export function formatUsd(value: string): string {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return value;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function explorerTxUrl(txHash: string): string {
  return `https://explore.tempo.xyz/tx/${txHash}`;
}

export function mppscanBuyerUrl(address: string): string {
  return `https://mppscan.com/buyer/${address}`;
}

export function rangeFromParam(
  value: string | string[] | undefined,
): TimeRange {
  return value === "1d" || value === "7d" || value === "30d" ? value : "all";
}

export function sortFromParam(
  value: string | string[] | undefined,
): SessionSort {
  return value === "deposit" || value === "settled" ? value : "opened";
}

export function dirFromParam(value: string | string[] | undefined): SortDir {
  return value === "asc" ? "asc" : "desc";
}

export function statusFromParam(
  value: string | string[] | undefined,
): Channel["status"] | null {
  return value === "open" || value === "closing" || value === "closed"
    ? value
    : null;
}

export function pageFromParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return 1;
  const page = Number.parseInt(raw, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function tableHref({
  sort,
  dir,
  status,
  range,
  page,
}: {
  sort: SessionSort;
  dir: SortDir;
  status: Channel["status"] | null;
  range: TimeRange;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (sort !== "opened" || dir !== "desc") {
    params.set("sort", sort);
    params.set("dir", dir);
  }
  if (status) params.set("status", status);
  if (range !== "all") params.set("range", range);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
