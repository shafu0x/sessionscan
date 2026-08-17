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
}: {
  id?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          {id ? (
            <BreadcrumbLink href="/" className="font-bold text-base">
              MPP Sessions
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="font-bold text-base">
              MPP Sessions
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {id ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono">
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
