import { ArrowUp, Banknote, Lock, Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PHASES = [
  {
    icon: Plus,
    title: "Open",
    body: "The payer deposits stablecoins into a channel reserve on Tempo. That deposit is the ceiling — the service can never claim more than what is locked, and the payer cannot spend it anywhere else while the channel is live.",
  },
  {
    icon: Banknote,
    title: "Consume and settle",
    body: "For every unit of service — an API call, a token, a byte — the payer signs a voucher stating the new cumulative total. The service verifies the signature in microseconds and keeps serving. Whenever it chooses, it submits the highest voucher it holds onchain. That transaction is a settlement, and it is the only part you can see here.",
  },
  {
    icon: ArrowUp,
    title: "Top up",
    body: "If the reserve runs low, the payer adds more to it without interrupting the session. Vouchers keep flowing against the larger deposit.",
  },
  {
    icon: Lock,
    title: "Close",
    body: "Either side can close the channel. The final settlement pays the service its last accepted voucher and returns whatever is left to the payer.",
  },
] as const;

export function Lifecycle() {
  return (
    <Card>
      <CardContent className="flex flex-col">
        {PHASES.map((phase, index) => (
          <div key={phase.title}>
            {index > 0 ? <Separator className="my-4" /> : null}
            <div className="flex gap-3">
              <phase.icon
                className="mt-1 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-medium">{phase.title}</p>
                <p className="text-pretty text-muted-foreground leading-relaxed">
                  {phase.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
