"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

export const BalanceChartDynamic = dynamic(
  () => import("./balance-chart").then((mod) => mod.BalanceChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-70 w-full rounded-lg" aria-hidden />,
  },
);
