import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";

import { ChartsRowSkeleton } from "./_components/charts-row-skeleton";
import { SessionsTableSkeleton } from "./_components/sessions-table-skeleton";

export default function HomeLoading() {
  return (
    <>
      <SessionBreadcrumbs />
      <ChartsRowSkeleton />
      <SessionsTableSkeleton />
    </>
  );
}
