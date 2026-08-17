import { ArrowUp, Banknote, Lock, Plus, Timer, X } from "lucide-react";
import { formatRelativeTime, formatUsd } from "@/channels/format";
import type { SessionEventView } from "@/channels/types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TablePagination } from "@/components/ui/table-pagination";

import { TxLink } from "./tx-link";

const PAGE_SIZE = 10;

const EVENT_ICON = {
  opened: Plus,
  top_up: ArrowUp,
  settled: Banknote,
  close_requested: Timer,
  close_cancelled: X,
  closed: Lock,
} as const;

function labelFor(event: SessionEventView): string {
  switch (event.type) {
    case "opened":
      return `Opened · $${formatUsd(event.amounts.deposit ?? "0")}`;
    case "top_up":
      return `Top up · +$${formatUsd(event.amounts.additionalDeposit ?? "0")}`;
    case "settled":
      return `Settled · $${formatUsd(event.amounts.deltaPaid ?? "0")}`;
    case "close_requested":
      return "Close requested";
    case "close_cancelled":
      return "Close cancelled";
    case "closed":
      return `Closed · settled $${formatUsd(event.amounts.settledToPayee ?? "0")}`;
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
}: {
  id: string;
  events: SessionEventView[];
  page: number;
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
          return (
            <div key={`${event.txHash}-${event.logIndex}`}>
              {index > 0 ? <Separator className="my-3" /> : null}
              <div className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 size-4 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{labelFor(event)}</p>
                  <time
                    className="text-muted-foreground text-xs"
                    dateTime={event.ts}
                    title={event.ts}
                  >
                    {formatRelativeTime(new Date(event.ts))}
                  </time>
                </div>
                <TxLink txHash={event.txHash} />
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
