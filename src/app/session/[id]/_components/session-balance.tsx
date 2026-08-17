import { formatUsd } from "@/channels/format";
import type { SessionDetail } from "@/channels/types";
import { Card, CardContent } from "@/components/ui/card";

import { BalanceChart, type BalancePoint } from "./balance-chart";

function num(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildPoints(session: SessionDetail): BalancePoint[] {
  let escrow = 0;
  let settled = 0;
  let refunded = 0;
  const points: BalancePoint[] = [];

  for (const event of session.events) {
    let label: string;

    switch (event.type) {
      case "opened": {
        const deposit = num(event.amounts.deposit ?? session.deposit);
        escrow += deposit;
        label = `Opened · $${formatUsd(String(deposit))}`;
        break;
      }
      case "top_up": {
        const amount = num(event.amounts.additionalDeposit);
        escrow += amount;
        label = `Top up · +$${formatUsd(String(amount))}`;
        break;
      }
      case "settled": {
        const amount = num(event.amounts.deltaPaid);
        escrow = Math.max(0, escrow - amount);
        settled += amount;
        label = `Settled · $${formatUsd(String(amount))}`;
        break;
      }
      case "close_requested": {
        label = "Close requested";
        break;
      }
      case "close_cancelled": {
        label = "Close cancelled";
        break;
      }
      case "closed": {
        settled = num(event.amounts.settledToPayee ?? String(settled));
        refunded = num(event.amounts.refundedToPayer);
        escrow = 0;
        label = `Closed · settled $${formatUsd(String(settled))}`;
        break;
      }
      default: {
        const exhaustive: never = event.type;
        throw new Error(`unhandled event ${exhaustive}`);
      }
    }

    points.push({
      ts: Date.parse(event.ts),
      escrow,
      settled,
      refunded,
      kind: "event",
      label,
    });
  }

  const last = points.at(-1);
  if (session.status !== "closed" && last) {
    points.push({ ...last, ts: Date.now(), kind: "now", label: "Now" });
  }

  return points;
}

export function SessionBalance({ session }: { session: SessionDetail }) {
  const points = buildPoints(session);
  if (points.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <BalanceChart points={points} />
      </CardContent>
    </Card>
  );
}
