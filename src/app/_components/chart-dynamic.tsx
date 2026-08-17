"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

export const ChartDynamic = dynamic(
  () => import("./chart-body").then((mod) => mod.ChartBody),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full w-full rounded-lg" aria-hidden />
    ),
  },
);
