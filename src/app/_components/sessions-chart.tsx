import { formatCompact } from "@/channels/format";
import type { DayPoint } from "@/channels/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChartDynamic } from "./chart-dynamic";

export function SessionsChart({ data }: { data: DayPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Sessions
        </CardTitle>
        <p className="text-2xl font-semibold tracking-tight">
          {formatCompact(total)}
        </p>
      </CardHeader>
      <CardContent className="h-16">
        <ChartDynamic data={data} valueLabel="Sessions" />
      </CardContent>
    </Card>
  );
}
