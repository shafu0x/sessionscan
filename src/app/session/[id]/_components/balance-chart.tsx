"use client";

import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  type DotItemDotProps,
  ReferenceLine,
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
  x: number;
  members: BalancePoint[];
  startIndex: number;
  endIndex: number;
  text: string;
  icon: LucideIcon | null;
  labelFor: BalancePoint | null;
  labelled: boolean;
};

const Y_AXIS_WIDTH = 48;
const MARGIN = { top: 28, right: 16, left: 8, bottom: 0 };
const BRUSH_HEIGHT = 26;
const CLUSTER_PX = 14;
const LABEL_GAP_PX = 10;
const ICON_SIZE = 11;
const LABEL_CHAR_PX = 6.2;
const ICON_TEXT_GAP = 3;
const LABEL_OFFSET_Y = 22;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const DAY_MS = 86_400_000;

// Significant digits, not fixed decimals: micro-payment sessions produce
// sub-cent ticks that would otherwise all round to the same label.
const yTickFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumSignificantDigits: 3,
});

function tickFormatterFor(spanMs: number): (value: number) => string {
  if (spanMs <= 2 * DAY_MS) return (value) => timeFormat.format(value);
  return (value) => dateFormat.format(value);
}

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

function signedAmount(delta: number): string {
  const sign = delta > 0 ? "+" : "\u2212";
  return `${sign}$${formatUsd(String(Math.abs(delta)))}`;
}

function labelWidth(text: string, hasIcon: boolean): number {
  const iconPart = hasIcon ? ICON_SIZE : 0;
  if (!text) return iconPart;
  return iconPart + (hasIcon ? ICON_TEXT_GAP : 0) + text.length * LABEL_CHAR_PX;
}

/**
 * Groups events that land within `CLUSTER_PX` of each other at the current zoom
 * level, then keeps only the labels that still have room to render.
 */
function buildClusters(
  points: BalancePoint[],
  start: number,
  end: number,
  plotWidth: number,
): Cluster[] {
  if (plotWidth <= 0) return [];

  const first = points[start];
  const last = points[end];
  if (!first || !last) return [];

  const span = last.ts - first.ts || 1;
  const clusters: Cluster[] = [];

  for (let index = start; index <= end; index++) {
    const point = points[index];
    if (!point || point.kind === "now") continue;

    const x = ((point.ts - first.ts) / span) * plotWidth;
    const previous = clusters.at(-1);

    if (previous && x - previous.x <= CLUSTER_PX) {
      previous.members.push(point);
      previous.endIndex = index;
      continue;
    }

    clusters.push({
      x,
      members: [point],
      startIndex: index,
      endIndex: index,
      text: "",
      icon: null,
      labelFor: null,
      labelled: false,
    });
  }

  let lastRight = Number.NEGATIVE_INFINITY;
  for (const cluster of clusters) {
    const head = cluster.members[0];
    if (!head) continue;

    // The label sits above the highest point of the group; a mixed-type group
    // gets no icon because a single icon would misrepresent it.
    cluster.labelFor = cluster.members.reduce(
      (top, member) => (member.escrow > top.escrow ? member : top),
      head,
    );
    const uniform = cluster.members.every(
      (member) => member.type === head.type,
    );
    cluster.icon = uniform ? EVENT_META[head.type].icon : null;
    if (cluster.members.length > 1) {
      cluster.text = `\u00d7${cluster.members.length}`;
    } else if (head.delta !== 0) {
      cluster.text = signedAmount(head.delta);
    }

    const width = labelWidth(cluster.text, cluster.icon != null);
    // Clamp into the plot the same way the renderer does, so edge events keep
    // their labels instead of losing them.
    const left = Math.min(
      Math.max(0, cluster.x - width / 2),
      plotWidth - width,
    );
    if (left >= lastRight + LABEL_GAP_PX && left + width <= plotWidth) {
      cluster.labelled = true;
      lastRight = left + width;
    }
  }

  return clusters;
}

function ClusterLabel({
  cluster,
  cx,
  cy,
  plotWidth,
}: {
  cluster: Cluster;
  cx: number;
  cy: number;
  plotWidth: number;
}) {
  const Icon = cluster.icon;
  const width = labelWidth(cluster.text, Icon != null);
  const plotLeft = MARGIN.left + Y_AXIS_WIDTH;
  const left = Math.min(
    Math.max(cx - width / 2, plotLeft + 2),
    plotLeft + plotWidth - width - 2,
  );
  const textX = Icon ? left + ICON_SIZE + ICON_TEXT_GAP : left;

  return (
    <g aria-hidden>
      {Icon ? (
        <Icon
          x={left}
          y={cy - LABEL_OFFSET_Y}
          width={ICON_SIZE}
          height={ICON_SIZE}
          className="text-muted-foreground"
        />
      ) : null}
      {cluster.text ? (
        <text
          x={textX}
          y={cy - LABEL_OFFSET_Y + ICON_SIZE - 1}
          className="fill-foreground font-mono text-[10px] tabular-nums"
        >
          {cluster.text}
        </text>
      ) : null}
    </g>
  );
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

  const cluster = clusters.get(point);
  const members = cluster?.members ?? [point];
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
                {member.delta === 0 ? "—" : signedAmount(member.delta)}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [range, setRange] = useState<{ start: number; end: number } | null>(
    null,
  );
  const [brushKey, setBrushKey] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const lastIndex = points.length - 1;
  const start = range ? range.start : 0;
  const end = range ? range.end : lastIndex;
  const zoomed = start > 0 || end < lastIndex;

  const plotWidth = Math.max(
    0,
    width - Y_AXIS_WIDTH - MARGIN.left - MARGIN.right,
  );

  const clusters = useMemo(
    () => buildClusters(points, start, end, plotWidth),
    [points, start, end, plotWidth],
  );

  const clusterByPoint = useMemo(() => {
    const map = new Map<BalancePoint, Cluster>();
    for (const cluster of clusters) {
      for (const member of cluster.members) map.set(member, cluster);
    }
    return map;
  }, [clusters]);

  // Only offer the brush when zooming can actually separate something:
  // a crowded group whose members do not all share the same instant.
  const crowded = useMemo(() => {
    if (points.length < 3 || plotWidth <= 0) return false;
    const full = buildClusters(points, 0, lastIndex, plotWidth);
    return full.some((cluster) => {
      const first = cluster.members[0];
      const last = cluster.members.at(-1);
      return cluster.members.length > 1 && first && last && last.ts > first.ts;
    });
  }, [points, lastIndex, plotWidth]);

  const fullMax = useMemo(
    () => points.reduce((max, point) => Math.max(max, point.escrow), 0),
    [points],
  );

  const visibleMax = useMemo(() => {
    let max = 0;
    for (let index = start; index <= end; index++) {
      const point = points[index];
      if (point) max = Math.max(max, point.escrow);
    }
    return max;
  }, [points, start, end]);

  // Clicking a multi-event mark drills into it; the chart handler avoids
  // putting a click target on a bare SVG shape.
  const handleChartClick = useCallback(
    (state: { activeTooltipIndex?: unknown }) => {
      // recharts may report the index as a number or a numeric string.
      const offset = Number(state.activeTooltipIndex);
      if (!Number.isInteger(offset) || offset < 0) return;

      const point = points[start + offset];
      const cluster = point ? clusterByPoint.get(point) : undefined;
      if (!cluster || cluster.endIndex === cluster.startIndex) return;

      const first = cluster.members[0];
      const last = cluster.members.at(-1);
      if (!first || !last || first.ts === last.ts) return;

      setRange({ start: cluster.startIndex, end: cluster.endIndex });
      setBrushKey((key) => key + 1);
    },
    [clusterByPoint, points, start],
  );

  // Every event keeps its dot so same-instant stacks stay visible as a
  // vertical run; the label renders once per group, above its highest dot.
  const renderDot = useCallback(
    (props: DotItemDotProps) => {
      const { key, cx, cy } = props;
      const point = props.payload as BalancePoint;

      if (cx == null || cy == null || point.kind === "now") {
        return <circle key={key} r={0} fill="none" />;
      }

      const cluster = clusterByPoint.get(point);
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
          {cluster?.labelled && cluster.labelFor === point ? (
            <ClusterLabel
              cluster={cluster}
              cx={cx}
              cy={cy}
              plotWidth={plotWidth}
            />
          ) : null}
        </g>
      );
    },
    [clusterByPoint, plotWidth],
  );

  return (
    <div>
      {zoomed && fullMax > visibleMax ? (
        <p className="mb-1 font-mono text-muted-foreground text-xs tabular-nums">
          Session max ${formatUsd(String(fullMax))}
        </p>
      ) : null}
      <div
        ref={containerRef}
        className="h-64"
        role="img"
        aria-label={`Escrow balance across ${points.length} session events. The timeline below lists every event.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={MARGIN} onClick={handleChartClick}>
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={tickFormatterFor(
                (points[end]?.ts ?? 0) - (points[start]?.ts ?? 0),
              )}
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
              width={Y_AXIS_WIDTH}
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
            <Tooltip content={<BalanceTooltip clusters={clusterByPoint} />} />
            {zoomed && fullMax > visibleMax ? (
              <ReferenceLine
                y={fullMax}
                ifOverflow="hidden"
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
            ) : null}
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
            {crowded ? (
              <Brush
                key={brushKey}
                dataKey="ts"
                height={BRUSH_HEIGHT}
                travellerWidth={10}
                startIndex={start}
                endIndex={end}
                stroke="var(--border)"
                fill="var(--card)"
                tickFormatter={tickFormatterFor(
                  (points[lastIndex]?.ts ?? 0) - (points[0]?.ts ?? 0),
                )}
                onChange={(next) => {
                  if (next.startIndex == null || next.endIndex == null) return;
                  setRange({ start: next.startIndex, end: next.endIndex });
                }}
              >
                <AreaChart>
                  <Area
                    type="stepAfter"
                    dataKey="escrow"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </Brush>
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
