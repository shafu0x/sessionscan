import type { Metadata } from "next";
import { Suspense } from "react";

import { ClosingNote } from "./_components/closing-note";
import { ExampleSession } from "./_components/example-session";
import { ExampleSessionSkeleton } from "./_components/example-session-skeleton";
import { Lifecycle } from "./_components/lifecycle";
import { OverviewStats } from "./_components/overview-stats";
import { OverviewStatsSkeleton } from "./_components/overview-stats-skeleton";

export const metadata: Metadata = {
  title: "MPP Sessions Explained",
  description:
    "How Tempo MPP sessions work: a payment channel opens with a deposit, the payer signs offchain vouchers as it consumes a service, and the service settles the highest voucher onchain.",
};

const HEADING = "font-medium text-xl tracking-tight";
const BODY = "text-pretty text-muted-foreground leading-relaxed";
const LINK = "underline underline-offset-4 hover:text-foreground";

const FURTHER_READING = [
  {
    href: "https://tempo.xyz/blog/mpp-sessions/",
    label: "MPP Sessions: Web-Scale Payments for AI Agents",
    note: "the concepts, without the code",
  },
  {
    href: "https://mpp.dev/payment-methods/tempo/session",
    label: "Sessions on mpp.dev",
    note: "how to integrate them in your own server or client",
  },
  {
    href: "https://tips.sh/1034",
    label: "TIP-1034",
    note: "the precompile that holds the reserves",
  },
  {
    href: "https://paymentauth.org/draft-tempo-session-00",
    label: "IETF specification",
    note: "the voucher format and HTTP flow in full",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-semibold text-3xl tracking-tight">
          How MPP sessions work
        </h1>
        <p className={BODY}>
          Sessionscan indexes payment channels on{" "}
          <a
            href="https://tempo.xyz"
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            Tempo
          </a>
          , the primitive behind sessions in the{" "}
          <a
            href="https://mpp.dev"
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            Machine Payments Protocol
          </a>
          . Sessions are how software pays for something continuously — per API
          call, per token, per byte — without sending a transaction for each
          payment.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>What you are looking at</h2>
        <p className={BODY}>
          Every row on the home page is one channel between a payer and a
          service.{" "}
          <strong className="font-medium text-foreground">Deposit</strong> is
          what the payer locked up when the channel opened.{" "}
          <strong className="font-medium text-foreground">Settled</strong> is
          how much of it the service has claimed onchain so far.{" "}
          <strong className="font-medium text-foreground">In escrow</strong> is
          the remainder — still locked, not yet claimed, and refundable to the
          payer if the channel closes without it being spent.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>You are seeing the onchain skeleton</h2>
        <p className={BODY}>
          A session&apos;s whole purpose is that most of it never touches the
          chain. Sessionscan reads six kinds of onchain event: a channel
          opening, a settlement, a top up, a close request, a cancelled close,
          and a close. The payments themselves — one signed message per request
          — are exchanged directly between the payer and the service and are
          never broadcast anywhere.
        </p>
        <p className={BODY}>
          So no explorer can show you those payments, including this one. What
          you get here are the bookends: the money going in, the amounts claimed
          against it, and the refund at the end. If a session settled $0.05
          across three transactions, the thousands of signatures in between left
          no trace by design.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>The lifecycle</h2>
        <Lifecycle />
        <Suspense fallback={null}>
          <ClosingNote />
        </Suspense>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>Why sessions exist</h2>
        <p className={BODY}>
          It works like a card authorization at a fuel pump. The pump holds an
          amount up front, meters what you actually use, and charges once at the
          end — two interactions with the payment network no matter how much
          fuel flows. A session does the same thing for software: the deposit is
          the hold, each voucher is a meter reading, and settlement is the
          charge.
        </p>
        <p className={BODY}>
          The alternative is a transaction per request, which fails on both cost
          and latency. Nothing that bills per token can wait for a block, and
          nothing that charges fractions of a cent can afford a fee on every
          call. Verifying a voucher is a signature check measured in
          microseconds.
        </p>
        <Suspense fallback={<OverviewStatsSkeleton />}>
          <OverviewStats />
        </Suspense>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>A real session, start to finish</h2>
        <Suspense fallback={<ExampleSessionSkeleton />}>
          <ExampleSession />
        </Suspense>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>Where this data comes from</h2>
        <p className={BODY}>
          Sessionscan reads TIP-1034 channel reserve logs from the Tempo Indexer
          API on Tempo mainnet and re-syncs every ten minutes. Indexing starts
          at block 24,458,546, so anything earlier is not here. Amounts are
          shown as US dollars at six decimal places without looking up token
          symbols, and open channels are refreshed against the chain when you
          open their page — which means a session page can be slightly fresher
          than the table you clicked it from.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>Further reading</h2>
        <ul className="flex flex-col gap-2">
          {FURTHER_READING.map((item) => (
            <li key={item.href} className={BODY}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={LINK}
              >
                {item.label}
              </a>{" "}
              — {item.note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
