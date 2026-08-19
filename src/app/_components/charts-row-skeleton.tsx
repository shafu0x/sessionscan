import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-hidden>
      {["sessions", "volume", "buyers"].map((key) => (
        <Card key={key}>
          <CardHeader>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-20" />
          </CardHeader>
          <CardContent className="h-16">
            <Skeleton className="h-full w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
