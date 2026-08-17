import { DollarSign } from "lucide-react";

import type { DayPoint } from "@/channels/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChartDynamic } from "./chart-dynamic";

export function VolumeChart({ data }: { data: DayPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="size-4 text-muted-foreground" aria-hidden />
          Volume
        </CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ChartDynamic data={data} valueLabel="Volume" />
      </CardContent>
    </Card>
  );
}
