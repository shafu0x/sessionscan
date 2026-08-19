import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

import { ChartsRowSkeleton } from "./_components/charts-row-skeleton";
import { SessionsTableSkeleton } from "./_components/sessions-table-skeleton";

export default function HomeLoading() {
  return (
    <>
      <div className="mb-2 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <div className="flex flex-col gap-2 sm:gap-0">
          <SessionBreadcrumbs />
          <p className="text-pretty text-base text-muted-foreground leading-snug sm:hidden">
            MPP Sessions enable fast offchain micropayments with onchain
            settlement.
          </p>
        </div>
        <div className="flex w-full flex-row items-center gap-2 sm:w-auto">
          <Skeleton className="h-8 w-48 rounded-lg sm:hidden" />
          <Skeleton className="h-8 w-24 rounded-lg sm:hidden" />
          <Skeleton className="hidden h-8 w-80 rounded-lg sm:block" />
        </div>
      </div>
      <ChartsRowSkeleton />
      <SessionsTableSkeleton />
    </>
  );
}
