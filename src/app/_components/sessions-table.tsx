import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpFromLine,
  CircleDot,
  Clock,
  Hash,
  Inbox,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  formatRelativeTime,
  formatUsd,
  mppscanBuyerUrl,
  tableHref,
  truncateHex,
} from "@/channels/format";
import { loadSessionsPage } from "@/channels/queries";
import type {
  Channel,
  SessionSort,
  SortDir,
  TimeRange,
} from "@/channels/types";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";

function HeaderLabel({
  icon: Icon,
  children,
  align = "left",
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <span
      className={
        align === "right"
          ? "inline-flex w-full items-center justify-end gap-1.5"
          : "inline-flex items-center gap-1.5"
      }
    >
      <Icon className="size-3.5" aria-hidden />
      {children}
    </span>
  );
}

type StatusFilter = Channel["status"] | null;

function SortableHeaderLabel({
  column,
  icon: Icon,
  children,
  align = "left",
  sort,
  dir,
  status,
  range,
}: {
  column: SessionSort;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
  align?: "left" | "right";
  sort: SessionSort;
  dir: SortDir;
  status: StatusFilter;
  range: TimeRange;
}) {
  const active = sort === column;
  const nextDir = active && dir === "desc" ? "asc" : "desc";
  const DirIcon = dir === "desc" ? ArrowDown : ArrowUp;

  return (
    <Link
      href={tableHref({ sort: column, dir: nextDir, status, range })}
      className={
        align === "right"
          ? "inline-flex w-full items-center justify-end gap-1.5 hover:text-foreground"
          : "inline-flex items-center gap-1.5 hover:text-foreground"
      }
      aria-label={`Sort by ${column}, ${nextDir}ending`}
    >
      <Icon className="size-3.5" aria-hidden />
      {children}
      {active ? <DirIcon className="size-3" aria-hidden /> : null}
    </Link>
  );
}

export async function SessionsTable({
  page,
  sort,
  dir,
  status,
  range,
}: {
  page: number;
  sort: SessionSort;
  dir: SortDir;
  status: StatusFilter;
  range: TimeRange;
}) {
  const paginated = await loadSessionsPage(page, sort, dir, status, range);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {paginated.totalItems === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Inbox className="size-4" aria-hidden />
            <p className="text-sm">No sessions found.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {paginated.items.map((session) => (
                <Link
                  key={session.channelId}
                  href={`/session/${session.channelId}`}
                  prefetch={false}
                  className="flex min-h-11 flex-col gap-2 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={session.status} />
                    <time
                      className="text-muted-foreground text-xs"
                      dateTime={session.openedAt}
                      title={session.openedAt}
                    >
                      {formatRelativeTime(new Date(session.openedAt))}
                    </time>
                  </div>
                  <p className="truncate font-mono text-sm" translate="no">
                    {truncateHex(session.channelId)}
                  </p>
                  <div className="flex justify-between gap-2 text-muted-foreground text-xs">
                    <span className="truncate font-mono" translate="no">
                      {truncateHex(session.payer)} →{" "}
                      {truncateHex(session.payee)}
                    </span>
                    <span className="font-mono tabular-nums text-foreground">
                      ${formatUsd(session.settled)} / $
                      {formatUsd(session.deposit)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Table className="hidden table-fixed md:table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[11%]">
                    <HeaderLabel icon={CircleDot}>Status</HeaderLabel>
                  </TableHead>
                  <TableHead className="w-[14%]">
                    <HeaderLabel icon={Hash}>Session</HeaderLabel>
                  </TableHead>
                  <TableHead className="w-[14%]">
                    <HeaderLabel icon={User}>Payer</HeaderLabel>
                  </TableHead>
                  <TableHead className="w-[14%]">
                    <HeaderLabel icon={Wallet}>Payee</HeaderLabel>
                  </TableHead>
                  <TableHead className="w-[14%] text-right">
                    <SortableHeaderLabel
                      column="deposit"
                      icon={ArrowDownToLine}
                      align="right"
                      sort={sort}
                      dir={dir}
                      status={status}
                      range={range}
                    >
                      Deposit
                    </SortableHeaderLabel>
                  </TableHead>
                  <TableHead className="w-[14%] text-right">
                    <SortableHeaderLabel
                      column="settled"
                      icon={ArrowUpFromLine}
                      align="right"
                      sort={sort}
                      dir={dir}
                      status={status}
                      range={range}
                    >
                      Settled
                    </SortableHeaderLabel>
                  </TableHead>
                  <TableHead className="w-[19%] text-right">
                    <HeaderLabel icon={Clock} align="right">
                      Opened
                    </HeaderLabel>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.items.map((session) => (
                  <TableRow key={session.channelId} className="relative">
                    <TableCell>
                      <StatusBadge status={session.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/session/${session.channelId}`}
                        prefetch={false}
                        className="min-h-11 after:absolute after:inset-0 inline-flex items-center"
                        translate="no"
                      >
                        {truncateHex(session.channelId)}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <a
                        href={mppscanBuyerUrl(session.payer)}
                        target="_blank"
                        rel="noreferrer"
                        className="relative underline-offset-4 hover:underline"
                        translate="no"
                      >
                        {truncateHex(session.payer)}
                      </a>
                    </TableCell>
                    <TableCell className="font-mono text-xs" translate="no">
                      {truncateHex(session.payee)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      ${formatUsd(session.deposit)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      ${formatUsd(session.settled)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      <time
                        dateTime={session.openedAt}
                        title={session.openedAt}
                      >
                        {formatRelativeTime(new Date(session.openedAt))}
                      </time>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={paginated.currentPage}
              pageCount={paginated.pageCount}
              totalItems={paginated.totalItems}
              pageSize={paginated.pageSize}
              hrefForPage={(nextPage) =>
                tableHref({ sort, dir, status, range, page: nextPage })
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
