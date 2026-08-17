import { ArrowUp, Banknote, Lock, Plus, Timer, X } from "lucide-react";
import { formatRelativeTime, formatUsd } from "@/channels/format";
import type { SessionEventView } from "@/channels/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { TxLink } from "./tx-link";

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
      return `Settled · Δ$${formatUsd(event.amounts.deltaPaid ?? "0")}`;
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

export function SessionTimeline({ events }: { events: SessionEventView[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {events.map((event, index) => {
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
      </CardContent>
    </Card>
  );
}
