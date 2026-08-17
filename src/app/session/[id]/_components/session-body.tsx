import { notFound } from "next/navigation";
import { formatUsd, mppscanBuyerUrl, truncateHex } from "@/channels/format";
import { loadSessionData } from "@/channels/queries";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";

import { SessionSequence } from "./session-sequence";
import { SessionTimeline } from "./session-timeline";

export async function SessionBody({ id }: { id: string }) {
  const session = await loadSessionData(id);
  if (!session) notFound();

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">Remaining escrow</p>
              <p className="wrap-break-word font-mono text-4xl tabular-nums tracking-tight">
                ${formatUsd(session.remaining)}
              </p>
              <p className="text-muted-foreground text-sm">
                ${formatUsd(session.deposit)} deposit − $
                {formatUsd(session.settled)} settled
              </p>
            </div>
            <StatusBadge status={session.status} />
          </div>
          <p className="truncate font-mono text-muted-foreground text-xs">
            <a
              href={mppscanBuyerUrl(session.payer)}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
              translate="no"
            >
              {truncateHex(session.payer)}
            </a>
            {" → "}
            <span translate="no">{truncateHex(session.payee)}</span>
          </p>
        </CardContent>
      </Card>
      <SessionSequence session={session} />
      <SessionTimeline events={session.events} />
    </>
  );
}
