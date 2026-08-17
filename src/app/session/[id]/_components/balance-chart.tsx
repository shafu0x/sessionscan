"use client";

import {
  Area,
  AreaChart,
  type DotItemDotProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact, formatUsd } from "@/channels/format";

export type BalancePoint = {
  ts: number;
  escrow: number;
  settled: number;
  refunded: number;
  kind: "event" | "now";
  label: string;
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function renderDot(props: DotItemDotProps) {
  const { key, cx, cy } = props;
  const payload = props.payload as BalancePoint;
  if (cx == null || cy == null || payload.kind === "now") {
    return <circle key={key} r={0} fill="none" />;
  }
  return (
    <circle
      key={key}
      cx={cx}
      cy={cy}
      r={3.5}
      fill="var(--chart-1)"
      stroke="var(--card)"
      strokeWidth={1.5}
    />
  );
}

function BalanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: BalancePoint }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground text-xs shadow-md">
      <p className="font-medium">{point.label}</p>
      <p className="text-muted-foreground">
        {dateTimeFormat.format(new Date(point.ts))}
      </p>
      <div className="mt-1.5 space-y-0.5 font-mono tabular-nums">
        {(
          [
            ["In escrow", point.escrow],
            ["Settled", point.settled],
            ["Refunded", point.refunded],
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
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 4, right: 4, left: 8, bottom: 0 }}
        >
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value: number) => dateFormat.format(value)}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={48}
          />
          <YAxis
            tickFormatter={(value: number) => `$${formatCompact(value)}`}
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
          <Tooltip content={<BalanceTooltip />} />
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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
