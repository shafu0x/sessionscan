import Link from "next/link";

import { formatUsd } from "@/channels/format";
import { loadSessionData } from "@/channels/queries";
import { ServiceLabel } from "@/components/service-label";
import { SessionTimeline } from "@/components/session-timeline";
import { sendDiscordAlert } from "@/lib/discord";

const EXAMPLE_CHANNEL_ID =
  "0x4fd934398ae401e2fd4f69a94024248b2d0be6d1d643d5893640be7b7c11f71c";

export async function ExampleSession() {
  const session = await loadSessionData(EXAMPLE_CHANNEL_ID);

  if (!session) {
    sendDiscordAlert(
      `/about is missing its example session ${EXAMPLE_CHANNEL_ID}`,
    );
    return null;
  }

  const settlements = session.events.filter(
    (event) => event.type === "settled",
  );
  const cumulatives = settlements
    .map((event) => event.amounts.cumulative)
    .filter((value): value is string => Boolean(value));
  const lastSettlement = settlements.at(-1);
  const minutes = lastSettlement
    ? Math.max(
        1,
        Math.round(
          (new Date(lastSettlement.ts).getTime() -
            new Date(session.openedAt).getTime()) /
            60_000,
        ),
      )
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-pretty text-muted-foreground leading-relaxed">
        A payer locked ${formatUsd(session.deposit)} into a channel with{" "}
        <ServiceLabel payee={session.payee} link={false} />, then spent it in
        pieces. The service settled {settlements.length} times, each transaction
        submitting a newer voucher with a higher cumulative total:{" "}
        {cumulatives.map((value) => `$${formatUsd(value)}`).join(" → ")} — all
        within {minutes} minutes of the channel opening.
      </p>
      <p className="text-pretty text-muted-foreground leading-relaxed">
        When the channel closed, ${formatUsd(session.settled)} went to the
        service and ${formatUsd(session.refunded)} went back to the payer. Those
        two figures add up to the deposit exactly — that reconciliation is what
        the reserve guarantees, and it is why the payer never had to trust the
        service with more than it actually spent.
      </p>
      <SessionTimeline
        id={session.channelId}
        events={session.events}
        page={1}
        timestamps="absolute"
      />
      <p className="text-muted-foreground text-sm">
        <Link
          href={`/session/${session.channelId}`}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Open this session
        </Link>
      </p>
    </div>
  );
}
