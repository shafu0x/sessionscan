import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["opened", "settled-1", "settled-2", "closed"];

export function ExampleSessionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-16 w-full" />
      <Card>
        <CardContent className="flex flex-col gap-6">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center gap-3">
              <Skeleton className="size-4 shrink-0 rounded-sm" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
