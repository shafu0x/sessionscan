import { loadChartSeries } from "@/channels/queries";
import type { TimeRange } from "@/channels/types";

import { BuyersChart } from "./buyers-chart";
import { SessionsChart } from "./sessions-chart";
import { VolumeChart } from "./volume-chart";

export async function ChartsRow({ range }: { range: TimeRange }) {
  const series = await loadChartSeries(range);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SessionsChart data={series.sessions} />
      <VolumeChart data={series.volume} />
      <BuyersChart data={series.buyers} />
    </div>
  );
}
