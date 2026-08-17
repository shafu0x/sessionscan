import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";

import { SessionDetailSkeleton } from "./_components/session-detail-skeleton";

export default function SessionLoading() {
  return (
    <>
      <SessionBreadcrumbs />
      <SessionDetailSkeleton />
    </>
  );
}
