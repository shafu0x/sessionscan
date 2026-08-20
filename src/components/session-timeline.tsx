import { ArrowUp, Banknote, Lock, Plus, Timer, X } from "lucide-react";
import {
  explorerTxUrl,
  formatRelativeTime,
  formatUsd,
} from "@/channels/format";
import type { SessionEventView } from "@/channels/types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatAbsoluteTime } from "@/lib/date";

const PAGE_SIZE = 10;

const EVENT_ICON = {
  opened: Plus,
  top_up: ArrowUp,
  settled: Banknote,
  close_requested: Timer,
  close_cancelled: X,
  closed: Lock,
} as const;

function actionFor(event: SessionEventView): string {
  switch (event.type) {
    case "opened":
      return "Opened";
    case "top_up":
      return "Top up";
    case "settled":
      return "Settled";
    case "close_requested":
      return "Close requested";
    case "close_cancelled":
      return "Close cancelled";
    case "closed":
      return "Closed";
    default: {
      const exhaustive: never = event.type;
      throw new Error(`unhandled event ${exhaustive}`);
    }
  }
}

function amountFor(event: SessionEventView): string | null {
  switch (event.type) {
    case "opened":
      return `$${formatUsd(event.amounts.deposit ?? "0")}`;
    case "top_up":
      return `+$${formatUsd(event.amounts.additionalDeposit ?? "0")}`;
    case "settled":
      return `$${formatUsd(event.amounts.deltaPaid ?? "0")}`;
    case "closed":
      return `$${formatUsd(event.amounts.settledToPayee ?? "0")}`;
    case "close_requested":
    case "close_cancelled":
      return null;
    default: {
      const exhaustive: never = event.type;
      throw new Error(`unhandled event ${exhaustive}`);
    }
  }
}

export function SessionTimeline({
  id,
  events,
  page,
  timestamps = "relative",
}: {
  id: string;
  events: SessionEventView[];
  page: number;
  timestamps?: "relative" | "absolute";
}) {
  const pageCount = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const pageEvents = events.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <Card>
      <CardContent className="flex flex-col">
        {pageEvents.map((event, index) => {
          const Icon = EVENT_ICON[event.type];
          const amount = amountFor(event);
          return (
            <div key={`${event.txHash}-${event.logIndex}`}>
              {index > 0 ? <Separator className="my-3" /> : null}
              <div className="flex items-center gap-3">
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={explorerTxUrl(event.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm hover:text-muted-foreground"
                  >
                    {actionFor(event)}
                  </a>
                  <time
                    className="block text-muted-foreground text-xs"
                    dateTime={event.ts}
                    title={event.ts}
                  >
                    {timestamps === "absolute"
                      ? formatAbsoluteTime(new Date(event.ts))
                      : formatRelativeTime(new Date(event.ts))}
                  </time>
                </div>
                {amount ? (
                  <p className="shrink-0 font-mono text-sm tabular-nums">
                    {amount}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
        <TablePagination
          currentPage={safePage}
          pageCount={pageCount}
          totalItems={events.length}
          pageSize={PAGE_SIZE}
          hrefForPage={(nextPage) =>
            nextPage > 1 ? `/session/${id}?page=${nextPage}` : `/session/${id}`
          }
        />
      </CardContent>
    </Card>
  );
}
