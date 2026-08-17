import { Activity } from "lucide-react";

import type { DayPoint } from "@/channels/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChartDynamic } from "./chart-dynamic";

export function SessionsChart({ data }: { data: DayPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4 text-muted-foreground" aria-hidden />
          Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ChartDynamic data={data} valueLabel="Sessions" />
      </CardContent>
    </Card>
  );
}
