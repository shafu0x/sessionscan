import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionsTableSkeleton() {
  return (
    <Card className="py-0 pb-(--card-spacing)" aria-hidden>
      <CardContent className="flex flex-col gap-3">
        {["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].map((key) => (
          <Skeleton key={key} className="h-20 w-full rounded-lg md:h-10" />
        ))}
      </CardContent>
    </Card>
  );
}
