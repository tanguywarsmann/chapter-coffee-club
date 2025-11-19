import { BookGridSkeleton } from "@/components/ui/book-grid-skeleton";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border-none">
        <div className="p-8 md:p-10 space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="h-56 w-40 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border-none p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
        <BookGridSkeleton count={8} />
      </Card>
    </div>
  );
}
