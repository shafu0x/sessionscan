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
import { StatusFilter } from "./_components/status-filter";

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
      <div className="mb-2 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <div className="flex flex-col gap-2 sm:gap-0">
          <SessionBreadcrumbs />
          <p className="text-pretty text-base text-muted-foreground leading-snug sm:hidden">
            MPP Sessions enable fast offchain micropayments with onchain
            settlement.
          </p>
        </div>
        <div className="flex w-full flex-row items-center gap-2 sm:w-auto">
          <Search />
          <div className="flex min-w-0 flex-1 flex-row items-center gap-2 sm:flex-none sm:gap-0 sm:overflow-hidden sm:rounded-lg sm:bg-card sm:ring-1 sm:ring-foreground/10">
            <div className="min-w-0 shrink overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 sm:rounded-none sm:bg-transparent sm:ring-0">
              <RangeSelector
                sort={sort}
                dir={dir}
                status={status}
                range={range}
              />
            </div>
            <div className="shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 sm:rounded-none sm:bg-transparent sm:ring-0">
              <StatusFilter
                sort={sort}
                dir={dir}
                status={status}
                range={range}
              />
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={<ChartsRowSkeleton />}>
        <ChartsRow status={status} range={range} />
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
