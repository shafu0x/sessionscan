import { ArrowDownToLine, ArrowUpFromLine, Lock } from "lucide-react";
import { notFound } from "next/navigation";
import { formatUsd } from "@/channels/format";
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
              <p className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <Lock className="size-3.5" aria-hidden />
                Remaining escrow
              </p>
              <p className="wrap-break-word font-mono text-4xl tabular-nums tracking-tight">
                ${formatUsd(session.remaining)}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <ArrowDownToLine className="size-3.5" aria-hidden />
                  <span className="font-mono tabular-nums">
                    ${formatUsd(session.deposit)}
                  </span>
                  deposit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowUpFromLine className="size-3.5" aria-hidden />
                  <span className="font-mono tabular-nums">
                    ${formatUsd(session.settled)}
                  </span>
                  settled
                </span>
              </div>
            </div>
            <StatusBadge status={session.status} />
          </div>
        </CardContent>
      </Card>
      <SessionSequence session={session} />
      <SessionTimeline events={session.events} />
    </>
  );
}
