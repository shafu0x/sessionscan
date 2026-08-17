import type { Metadata } from "next";
import { Suspense } from "react";

import { pageFromParam, truncateHex } from "@/channels/format";
import { loadSessionData } from "@/channels/queries";
import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";

import { SessionBody } from "./_components/session-body";
import { SessionDetailSkeleton } from "./_components/session-detail-skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await loadSessionData(id);
  return {
    title: session ? truncateHex(session.channelId) : "Session",
  };
}

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page } = await searchParams;

  return (
    <>
      <SessionBreadcrumbs id={id} />
      <Suspense fallback={<SessionDetailSkeleton />}>
        <SessionBody id={id} page={pageFromParam(page)} />
      </Suspense>
    </>
  );
}
