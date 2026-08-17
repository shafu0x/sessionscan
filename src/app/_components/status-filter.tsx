"use client";

import { Circle, CircleCheck, CircleDot, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { tableHref } from "@/channels/format";
import type {
  Channel,
  SessionSort,
  SortDir,
  TimeRange,
} from "@/channels/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All", icon: CircleDot },
  { value: "open", label: "Open", icon: Circle },
  { value: "closing", label: "Closing", icon: Clock },
  { value: "closed", label: "Closed", icon: CircleCheck },
] as const;

export function StatusFilter({
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
  const router = useRouter();
  const current =
    STATUS_OPTIONS.find((option) => option.value === (status ?? "all")) ??
    STATUS_OPTIONS[0];

  return (
    <Select
      value={status ?? "all"}
      onValueChange={(value) => {
        router.push(
          tableHref({
            sort,
            dir,
            status: value === "all" ? null : (value as Channel["status"]),
            range,
          }),
        );
      }}
    >
      <SelectTrigger
        className="border-0 bg-card text-xs ring-1 ring-foreground/10 dark:bg-card dark:hover:bg-muted/50"
        aria-label="Filter by status"
      >
        <span className="flex items-center gap-1.5">
          <current.icon className="size-3" aria-hidden />
          {current.label}
        </span>
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <option.icon className="size-3" aria-hidden />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
