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
  id: string;
  badge?: React.ReactNode;
  logo?: React.ReactNode;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="font-normal text-foreground">
            SessionScan
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-1.5 font-mono">
            {logo}
            {truncateHex(id)}
          </BreadcrumbPage>
        </BreadcrumbItem>
        {badge}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
