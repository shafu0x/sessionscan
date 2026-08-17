import { truncateHex } from "@/channels/format";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function SessionBreadcrumbs({ id }: { id?: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          {id ? (
            <BreadcrumbLink href="/">Sessions</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Sessions</BreadcrumbPage>
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
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
