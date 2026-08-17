import { Users } from "lucide-react";

import type { DayPoint } from "@/channels/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChartDynamic } from "./chart-dynamic";

export function BuyersChart({ data }: { data: DayPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-muted-foreground" aria-hidden />
          Buyers
        </CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ChartDynamic data={data} valueLabel="Buyers" />
      </CardContent>
    </Card>
  );
}
