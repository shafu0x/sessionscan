import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] as const;

export function SessionsTableSkeleton() {
  return (
    <Card className="py-0 pb-(--card-spacing)" aria-hidden>
      <CardContent className="flex flex-col">
        <div className="flex flex-col divide-y divide-border md:hidden">
          {ROWS.map((key) => (
            <div key={key} className="flex min-h-11 flex-col gap-2 py-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden flex-col gap-3 py-(--card-spacing) md:flex">
          {ROWS.map((key) => (
            <Skeleton key={key} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
