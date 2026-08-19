import { ArrowRightLeft, Lock, Users, Wallet } from "lucide-react";

import { formatCompact } from "@/channels/format";
import { loadOverviewStats } from "@/channels/queries";
import { Card, CardContent } from "@/components/ui/card";

export async function OverviewStats() {
  const stats = await loadOverviewStats();
  const perSession =
    stats.sessions > 0 ? (stats.events / stats.sessions).toFixed(1) : "0";

  const items = [
    {
      label: "Sessions indexed",
      value: formatCompact(stats.sessions),
      icon: Wallet,
    },
    {
      label: "Settled",
      value: `$${formatCompact(Number.parseFloat(stats.settled))}`,
      icon: ArrowRightLeft,
    },
    {
      label: "In escrow",
      value: `$${formatCompact(Number.parseFloat(stats.escrow))}`,
      icon: Lock,
    },
    { label: "Payers", value: formatCompact(stats.payers), icon: Users },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => (
          <Card key={item.label}>
            <CardContent>
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <item.icon className="size-3.5" aria-hidden />
                  {item.label}
                </p>
                <p className="wrap-break-word font-mono text-2xl tabular-nums tracking-tight md:text-3xl">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-pretty text-muted-foreground leading-relaxed">
        Those {formatCompact(stats.sessions)} sessions have produced{" "}
        {formatCompact(stats.events)} onchain transactions in total — about{" "}
        {perSession} per session. Every payment in between was verified with a
        signature check and never reached the chain.
      </p>
    </div>
  );
}
