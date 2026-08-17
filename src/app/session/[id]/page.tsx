import type { Metadata } from "next";
import { Suspense } from "react";

import { pageFromParam, truncateHex } from "@/channels/format";
import { loadSessionData } from "@/channels/queries";
import { SessionBreadcrumbs } from "@/components/session-breadcrumbs";
import { StatusBadge } from "@/components/status-badge";

import { SessionBody } from "./_components/session-body";
import { SessionDetailSkeleton } from "./_components/session-detail-skeleton";

async function SessionStatus({ id }: { id: string }) {
  const session = await loadSessionData(id);
  if (!session) return null;
  return <StatusBadge status={session.status} />;
}

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
      <SessionBreadcrumbs
        id={id}
        badge={
          <Suspense>
            <SessionStatus id={id} />
          </Suspense>
        }
      />
      <Suspense fallback={<SessionDetailSkeleton />}>
        <SessionBody id={id} page={pageFromParam(page)} />
      </Suspense>
    </>
  );
}
