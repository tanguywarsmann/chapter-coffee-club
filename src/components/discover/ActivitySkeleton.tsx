import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivitySkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-300 p-4 bg-gray-50">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </Card>
  );
}

export function ActivitySkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ActivitySkeleton key={i} />
      ))}
    </div>
  );
}