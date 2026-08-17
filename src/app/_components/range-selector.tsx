import Link from "next/link";

import { tableHref } from "@/channels/format";
import type {
  Channel,
  SessionSort,
  SortDir,
  TimeRange,
} from "@/channels/types";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "1d", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "all", label: "All time" },
];

export function RangeSelector({
  sort,
  dir,
  status,
  range,
}: {
  sort: SessionSort;
  dir: SortDir;
  status: Channel["status"] | null;
  range: TimeRange;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGES.map((option) => (
        <Link
          key={option.value}
          href={tableHref({ sort, dir, status, range: option.value })}
          className={
            option.value === range
              ? "rounded-md bg-secondary px-3 py-1.5 text-secondary-foreground text-xs"
              : "rounded-md px-3 py-1.5 text-muted-foreground text-xs hover:text-foreground"
          }
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
