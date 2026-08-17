import { Suspense } from "react";

import {
  dirFromParam,
  pageFromParam,
  rangeFromParam,
  sortFromParam,
  statusFromParam,
} from "@/channels/format";
import { Search } from "@/components/search";
import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";

import { ChartsRow } from "./_components/charts-row";
import { ChartsRowSkeleton } from "./_components/charts-row-skeleton";
import { RangeSelector } from "./_components/range-selector";
import { SessionsTable } from "./_components/sessions-table";
import { SessionsTableSkeleton } from "./_components/sessions-table-skeleton";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    dir?: string;
    status?: string;
    range?: string;
  }>;
}) {
  const params = await searchParams;
  const page = pageFromParam(params.page);
  const sort = sortFromParam(params.sort);
  const dir = dirFromParam(params.dir);
  const status = statusFromParam(params.status);
  const range = rangeFromParam(params.range);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SessionBreadcrumbs />
        <Search />
        <RangeSelector sort={sort} dir={dir} status={status} range={range} />
      </div>
      <Suspense fallback={<ChartsRowSkeleton />}>
        <ChartsRow range={range} />
      </Suspense>
      <Suspense fallback={<SessionsTableSkeleton />}>
        <SessionsTable
          page={page}
          sort={sort}
          dir={dir}
          status={status}
          range={range}
        />
      </Suspense>
    </>
  );
}
