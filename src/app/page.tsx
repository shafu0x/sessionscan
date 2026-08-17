import { Suspense } from "react";

import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";

import { ChartsRow } from "./_components/charts-row";
import { ChartsRowSkeleton } from "./_components/charts-row-skeleton";
import { SessionsTable } from "./_components/sessions-table";
import { SessionsTableSkeleton } from "./_components/sessions-table-skeleton";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; dir?: string }>;
}) {
  const { page, sort, dir } = await searchParams;

  return (
    <>
      <SessionBreadcrumbs />
      <Suspense fallback={<ChartsRowSkeleton />}>
        <ChartsRow />
      </Suspense>
      <Suspense fallback={<SessionsTableSkeleton />}>
        <SessionsTable page={page} sort={sort} dir={dir} />
      </Suspense>
    </>
  );
}
