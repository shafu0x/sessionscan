import { ArrowRightLeft, Lock, Undo2, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { formatUsd } from "@/channels/format";
import { loadSessionData } from "@/channels/queries";
import { Card, CardContent } from "@/components/ui/card";

import { SessionBalance } from "./session-balance";
import { SessionTimeline } from "./session-timeline";

const STATS = [
  { key: "remaining", label: "In escrow", icon: Lock },
  { key: "deposit", label: "Deposit", icon: Wallet },
  { key: "settled", label: "Settled", icon: ArrowRightLeft },
  { key: "refunded", label: "Refunded", icon: Undo2 },
] as const;

export async function SessionBody({ id, page }: { id: string; page: number }) {
  const session = await loadSessionData(id);
  if (!session) notFound();

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.key}>
            <CardContent>
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <stat.icon className="size-3.5" aria-hidden />
                  {stat.label}
                </p>
                <p className="wrap-break-word font-mono text-3xl tabular-nums tracking-tight">
                  ${formatUsd(session[stat.key])}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <SessionBalance session={session} />
      <SessionTimeline id={id} events={session.events} page={page} />
    </>
  );
}
