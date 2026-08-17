import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6" aria-hidden>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {["a", "b", "c", "d", "e", "f"].map((key) => (
            <Skeleton key={key} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
