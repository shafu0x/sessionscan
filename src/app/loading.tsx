import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

import { ChartsRowSkeleton } from "./_components/charts-row-skeleton";
import { SessionsTableSkeleton } from "./_components/sessions-table-skeleton";

export default function HomeLoading() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SessionBreadcrumbs />
        <Skeleton className="h-8 w-80 rounded-lg" />
      </div>
      <ChartsRowSkeleton />
      <SessionsTableSkeleton />
    </>
  );
}
