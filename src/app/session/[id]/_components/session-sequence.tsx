import { formatUsd } from "@/channels/format";
import type { SessionDetail } from "@/channels/types";
import { Card, CardContent } from "@/components/ui/card";

import { SequenceDiagram } from "./sequence-diagram";

function mermaidText(value: string): string {
  return value.replaceAll("#", "").replaceAll(";", ",");
}

function buildChart(session: SessionDetail): string {
  const lines = [
    "sequenceDiagram",
    "  participant Client",
    "  participant Server",
    "  participant Tempo",
  ];

  const opened = session.events.find((event) => event.type === "opened");
  const topUps = session.events.filter((event) => event.type === "top_up");
  const settlements = session.events.filter(
    (event) => event.type === "settled",
  );
  const closed = session.events.find((event) => event.type === "closed");

  lines.push(
    `  Client->>Tempo: ${mermaidText(`open · $${formatUsd(opened?.amounts.deposit ?? session.deposit)} deposit`)}`,
  );

  if (topUps.length > 0) {
    const total = topUps.reduce(
      (sum, event) =>
        sum + Number.parseFloat(event.amounts.additionalDeposit ?? "0"),
      0,
    );
    const count = topUps.length > 1 ? `${topUps.length}× · ` : "";
    lines.push(
      `  Client->>Tempo: ${mermaidText(`top up · ${count}+$${formatUsd(String(total))}`)}`,
    );
  }

  lines.push("  Client->>Server: request + voucher");

  if (settlements.length > 0) {
    for (const event of settlements) {
      lines.push(
        `  Server->>Tempo: ${mermaidText(`settle · $${formatUsd(event.amounts.deltaPaid ?? "0")}`)}`,
      );
    }
  } else {
    const closeSettled = closed?.amounts.settledToPayee ?? "0";
    if (Number.parseFloat(closeSettled) > 0) {
      lines.push(
        `  Server->>Tempo: ${mermaidText(`settle · $${formatUsd(closeSettled)}`)}`,
      );
    }
  }

  if (session.status === "closing") {
    lines.push("  Client->>Tempo: request close");
  }

  if (closed) {
    lines.push("  Server->>Tempo: close");
    const refund = Number.parseFloat(closed.amounts.refundedToPayer ?? "0");
    if (refund > 0) {
      lines.push(
        `  Tempo-->>Client: ${mermaidText(`refund $${formatUsd(String(refund))}`)}`,
      );
    }
  }

  return lines.join("\n");
}

export function SessionSequence({ session }: { session: SessionDetail }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto">
        <SequenceDiagram chart={buildChart(session)} />
      </CardContent>
    </Card>
  );
}
