"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

import type { DayPoint } from "@/channels/types";
import { formatDay } from "@/lib/date";
import { formatChartValue } from "@/lib/number";

export function ChartBody({
  data,
  valueLabel,
  usd = false,
}: {
  data: DayPoint[];
  valueLabel: string;
  usd?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--popover-foreground)",
          }}
          labelStyle={{ color: "var(--muted-foreground)" }}
          formatter={(value) => [formatChartValue(value, usd), valueLabel]}
          labelFormatter={(_, payload) => formatDay(payload?.[0]?.payload?.day)}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.15}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
