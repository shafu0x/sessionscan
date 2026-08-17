import { Lock, User, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { explorerAddressUrl, formatUsd } from "@/channels/format";
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Lock className="size-3.5" aria-hidden />
                  In escrow
                </p>
                <p className="wrap-break-word font-mono text-4xl tabular-nums tracking-tight">
                  ${formatUsd(session.remaining)}
                </p>
              </div>
              <StatusBadge status={session.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-col gap-1">
              <p className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <User className="size-3.5" aria-hidden />
                Client
              </p>
              <a
                href={explorerAddressUrl(session.payer)}
                target="_blank"
                rel="noreferrer"
                className="wrap-break-word font-mono text-4xl text-muted-foreground tracking-tight underline-offset-4 hover:text-foreground hover:underline"
                translate="no"
              >
                {session.payer.slice(0, 6)}…
              </a>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex flex-col gap-1">
              <p className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <Wallet className="size-3.5" aria-hidden />
                Server
              </p>
              <a
                href={explorerAddressUrl(session.payee)}
                target="_blank"
                rel="noreferrer"
                className="wrap-break-word font-mono text-4xl text-muted-foreground tracking-tight underline-offset-4 hover:text-foreground hover:underline"
                translate="no"
              >
                {session.payee.slice(0, 6)}…
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      <SessionSequence session={session} />
      <SessionTimeline events={session.events} />
    </>
  );
}
