"use client";

import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  type DotItemDotProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd } from "@/channels/format";
import type { SessionEventView } from "@/channels/types";
import { EVENT_META } from "@/components/session-event-meta";

export type BalancePoint = {
  ts: number;
  escrow: number;
  settled: number;
  refunded: number;
  delta: number;
  type: SessionEventView["type"];
  kind: "event" | "now";
};

type Cluster = {
  members: BalancePoint[];
  // The mark renders once per group, above its highest dot.
  anchor: BalancePoint;
  // Mixed-type groups get no icon; a single icon would misrepresent them.
  icon: LucideIcon | null;
};

const DAY_MS = 86_400_000;
const ICON_SIZE = 12;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

// Significant digits, not fixed decimals: micro-payment sessions produce
// sub-cent ticks that would otherwise all round to the same label.
const yTickFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumSignificantDigits: 3,
});

function tickFormatterFor(spanMs: number): (value: number) => string {
  const format = spanMs <= 2 * DAY_MS ? timeFormat : dateFormat;
  return (value) => format.format(value);
}

function signedAmount(delta: number): string {
  const sign = delta > 0 ? "+" : "\u2212";
  return `${sign}$${formatUsd(String(Math.abs(delta)))}`;
}

function BalanceTooltip({
  active,
  payload,
  clusters,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: BalancePoint }>;
  clusters: Map<BalancePoint, Cluster>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  const members = clusters.get(point)?.members ?? [point];
  const latest = members.at(-1) ?? point;
  const shown = members.slice(0, 5);

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground text-xs shadow-md">
      <p className="font-medium">
        {point.kind === "now"
          ? "Now"
          : members.length > 1
            ? `${members.length} events`
            : EVENT_META[point.type].label}
        {members.length === 1 && point.delta !== 0 ? (
          <span className="ml-2 font-mono font-normal text-muted-foreground tabular-nums">
            {signedAmount(point.delta)}
          </span>
        ) : null}
      </p>
      <p className="text-muted-foreground">
        {dateTimeFormat.format(new Date(point.ts))}
      </p>
      {members.length > 1 ? (
        <div className="mt-1.5 space-y-0.5">
          {shown.map((member) => (
            <div
              key={`${member.ts}-${member.type}-${member.escrow}`}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-muted-foreground">
                {EVENT_META[member.type].label}
              </span>
              <span className="font-mono tabular-nums">
                {member.delta === 0 ? "\u2014" : signedAmount(member.delta)}
              </span>
            </div>
          ))}
          {members.length > shown.length ? (
            <p className="text-muted-foreground">
              +{members.length - shown.length} more
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-1.5 space-y-0.5 font-mono tabular-nums">
        {(
          [
            ["In escrow", latest.escrow],
            ["Settled", latest.settled],
            ["Refunded", latest.refunded],
          ] as const
        ).map(([name, value]) => (
          <div key={name} className="flex items-center justify-between gap-4">
            <span className="font-sans text-muted-foreground">{name}</span>
            <span>${formatUsd(String(value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BalanceChart({ points }: { points: BalancePoint[] }) {
  const lastIndex = points.length - 1;
  const [range, setRange] = useState({ start: 0, end: lastIndex });
  const showBrush = points.length >= 6;

  const end = Math.min(range.end, lastIndex);
  const visibleSpanMs = (points[end]?.ts ?? 0) - (points[range.start]?.ts ?? 0);

  // Events closer together than ~3% of the visible span merge into one group
  // with a single mark; zooming in shrinks the span and splits the groups.
  const clusters = useMemo(() => {
    const map = new Map<BalancePoint, Cluster>();
    const minGapMs = Math.max(1, visibleSpanMs * 0.03);

    let current: BalancePoint[] = [];
    const flush = () => {
      const head = current[0];
      if (!head) return;
      const cluster: Cluster = {
        members: current,
        anchor: current.reduce(
          (top, member) => (member.escrow > top.escrow ? member : top),
          head,
        ),
        icon: current.every((member) => member.type === head.type)
          ? EVENT_META[head.type].icon
          : null,
      };
      for (const member of current) map.set(member, cluster);
    };

    for (let index = range.start; index <= end; index++) {
      const point = points[index];
      if (!point || point.kind === "now") continue;
      const previous = current.at(-1);
      if (previous && point.ts - previous.ts < minGapMs) {
        current.push(point);
      } else {
        flush();
        current = [point];
      }
    }
    flush();

    return map;
  }, [points, range.start, end, visibleSpanMs]);

  const renderDot = (props: DotItemDotProps) => {
    const { key, cx, cy } = props;
    const point = props.payload as BalancePoint;
    if (cx == null || cy == null || point.kind === "now") {
      return <circle key={key} r={0} fill="none" />;
    }

    const cluster = clusters.get(point);
    const isAnchor = cluster?.anchor === point;
    const Icon = cluster?.icon;
    const count =
      cluster && cluster.members.length > 1
        ? `\u00d7${cluster.members.length}`
        : "";

    const markWidth =
      (Icon ? ICON_SIZE : 0) + (count ? count.length * 6 + (Icon ? 3 : 0) : 0);
    const markLeft = cx - markWidth / 2;

    return (
      <g key={key}>
        <circle
          cx={cx}
          cy={cy}
          r={3.5}
          fill="var(--chart-1)"
          stroke="var(--card)"
          strokeWidth={1.5}
        />
        {isAnchor ? (
          <g aria-hidden>
            {Icon ? (
              <Icon
                x={markLeft}
                y={cy - ICON_SIZE - 9}
                width={ICON_SIZE}
                height={ICON_SIZE}
                className="text-muted-foreground"
              />
            ) : null}
            {count ? (
              <text
                x={markLeft + (Icon ? ICON_SIZE + 3 : 0)}
                y={cy - 10}
                className="fill-muted-foreground font-mono text-[10px] tabular-nums"
              >
                {count}
              </text>
            ) : null}
          </g>
        ) : null}
      </g>
    );
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
        >
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={tickFormatterFor(visibleSpanMs)}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={48}
          />
          <YAxis
            tickFormatter={(value: number) => `$${yTickFormat.format(value)}`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            label={{
              value: "In escrow",
              angle: -90,
              position: "insideLeft",
              offset: 0,
              fill: "var(--muted-foreground)",
              fontSize: 11,
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip content={<BalanceTooltip clusters={clusters} />} />
          <Area
            type="stepAfter"
            dataKey="escrow"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.15}
            dot={renderDot}
            activeDot={false}
            isAnimationActive={false}
          />
          {showBrush ? (
            <Brush
              dataKey="ts"
              height={26}
              travellerWidth={10}
              stroke="var(--border)"
              fill="var(--card)"
              tickFormatter={() => ""}
              onChange={(next) => {
                if (next.startIndex == null || next.endIndex == null) return;
                setRange({ start: next.startIndex, end: next.endIndex });
              }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
