import Image from "next/image";

import { truncateHex } from "@/channels/format";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function SessionBreadcrumbs({
  id,
  badge,
  logo,
}: {
  id?: string;
  badge?: React.ReactNode;
  logo?: React.ReactNode;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          {id ? (
            <BreadcrumbLink href="/" className="font-normal text-foreground">
              SessionScan
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="flex items-center font-semibold text-3xl tracking-tight sm:font-normal sm:text-base sm:tracking-normal">
              <Image
                src="/icon.svg"
                alt=""
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-lg sm:size-4 sm:rounded-sm"
              />
              <span className="ml-1 sm:ml-0.5">essionScan</span>
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {id ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1.5 font-mono">
                {logo}
                {truncateHex(id)}
              </BreadcrumbPage>
            </BreadcrumbItem>
            {badge}
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
