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
            <BreadcrumbPage className="flex items-center text-base">
              <Image
                src="/icon.svg"
                alt=""
                width={16}
                height={16}
                className="size-4 shrink-0 rounded-sm"
              />
              <span className="ml-0.5">essionScan</span>
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
