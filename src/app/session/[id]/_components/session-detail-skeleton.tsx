import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6" aria-hidden>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
        {["client", "server"].map((key) => (
          <Card key={key}>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
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
