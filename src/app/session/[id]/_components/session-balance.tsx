import type { SessionDetail } from "@/channels/types";
import { Card, CardContent } from "@/components/ui/card";

import type { BalancePoint } from "./balance-chart";
import { BalanceChartDynamic } from "./balance-chart-dynamic";

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
    const before = escrow;

    switch (event.type) {
      case "opened": {
        escrow += num(event.amounts.deposit ?? session.deposit);
        break;
      }
      case "top_up": {
        escrow += num(event.amounts.additionalDeposit);
        break;
      }
      case "settled": {
        const amount = num(event.amounts.deltaPaid);
        escrow = Math.max(0, escrow - amount);
        settled += amount;
        break;
      }
      case "close_requested":
      case "close_cancelled": {
        break;
      }
      case "closed": {
        settled = num(event.amounts.settledToPayee ?? String(settled));
        refunded = num(event.amounts.refundedToPayer);
        escrow = 0;
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
      delta: escrow - before,
      type: event.type,
      kind: "event",
    });
  }

  const last = points.at(-1);
  if (session.status !== "closed" && last) {
    points.push({ ...last, ts: Date.now(), delta: 0, kind: "now" });
  }

  return points;
}

export function SessionBalance({ session }: { session: SessionDetail }) {
  const points = buildPoints(session);
  if (points.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <BalanceChartDynamic points={points} />
      </CardContent>
    </Card>
  );
}
