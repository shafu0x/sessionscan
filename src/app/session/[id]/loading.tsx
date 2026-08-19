import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

import { SessionDetailSkeleton } from "./_components/session-detail-skeleton";

export default function SessionLoading() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="font-normal text-foreground">
              SessionScan
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Skeleton className="h-4 w-28" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <SessionDetailSkeleton />
    </>
  );
}
