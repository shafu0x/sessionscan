"use client";

import { Circle, CircleCheck, CircleDot, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    status ?? "all",
  );
  const current =
    STATUS_OPTIONS.find((option) => option.value === optimisticStatus) ??
    STATUS_OPTIONS[0];

  return (
    <Select
      value={optimisticStatus}
      onValueChange={(value) => {
        startTransition(() => {
          setOptimisticStatus(value as typeof optimisticStatus);
          router.push(
            tableHref({
              sort,
              dir,
              status: value === "all" ? null : (value as Channel["status"]),
              range,
            }),
          );
        });
      }}
    >
      <SelectTrigger
        className="w-24! shrink-0 border-0 bg-card text-xs ring-1 ring-foreground/10 data-pending:opacity-70 dark:bg-card dark:hover:bg-muted/50"
        aria-label="Filter by status"
        data-pending={isPending || undefined}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
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
