import { formatCompact } from "@/channels/format";
import { loadOverviewStats } from "@/channels/queries";

export async function ClosingNote() {
  const stats = await loadOverviewStats();

  return (
    <p className="text-pretty text-muted-foreground leading-relaxed">
      Closing is optional, and rare in practice: of the{" "}
      {formatCompact(stats.sessions)} channels indexed here, only{" "}
      {formatCompact(stats.closed)} have closed. Channels do not close
      themselves — if nobody calls close, the deposit stays reserved until the
      service closes it or the channel expires. That is why almost every row on
      the home page still shows a balance in escrow.
    </p>
  );
}
