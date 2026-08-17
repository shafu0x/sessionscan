import { formatUsd } from "@/channels/format";
import type { SessionDetail, SessionEventView } from "@/channels/types";
import { Card, CardContent } from "@/components/ui/card";

import { SequenceDiagram } from "./sequence-diagram";

function amount(event: SessionEventView, key: string): string {
  return event.amounts[key] ?? "0";
}

function mermaidText(value: string): string {
  return value.replaceAll("#", "").replaceAll(";", ",");
}

function buildChart(session: SessionDetail): string {
  const lines = [
    "sequenceDiagram",
    "  autonumber",
    "  participant Client",
    "  participant Server",
    "  participant Tempo",
  ];

  const afterOpen: string[] = [];
  let settlements = 0;

  for (const event of session.events) {
    switch (event.type) {
      case "opened":
        lines.push(
          `  Client->>Tempo: ${mermaidText(`open $${formatUsd(amount(event, "deposit"))}`)}`,
        );
        lines.push("  Tempo-->>Client: ChannelOpened");
        break;
      case "top_up":
        afterOpen.push(
          `  Client->>Tempo: ${mermaidText(`top up +$${formatUsd(amount(event, "additionalDeposit"))}`)}`,
        );
        break;
      case "settled":
        settlements += 1;
        afterOpen.push(
          `  Server->>Tempo: ${mermaidText(`settle Δ$${formatUsd(amount(event, "deltaPaid"))}`)}`,
        );
        afterOpen.push(
          `  Tempo-->>Server: ${mermaidText(`Settled cumulative $${formatUsd(amount(event, "cumulative"))}`)}`,
        );
        break;
      case "close_requested":
        afterOpen.push("  Client->>Tempo: requestClose");
        break;
      case "close_cancelled":
        afterOpen.push("  Tempo-->>Client: CloseRequestCancelled");
        break;
      case "closed":
        afterOpen.push("  Server->>Tempo: close");
        afterOpen.push(
          `  Tempo-->>Client: ${mermaidText(`ChannelClosed settled $${formatUsd(amount(event, "settledToPayee"))} + refund $${formatUsd(amount(event, "refundedToPayer"))}`)}`,
        );
        break;
      default: {
        const exhaustive: never = event.type;
        throw new Error(`unhandled event ${exhaustive}`);
      }
    }
  }

  lines.push("  loop Per request");
  lines.push("    Client->>Server: Request + voucher");
  lines.push("    Note over Server: recover signature");
  lines.push(
    `    Note over Server: ${mermaidText(`off-chain, not indexed · ${settlements} settlements`)}`,
  );
  lines.push("  end");
  lines.push(...afterOpen);

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
