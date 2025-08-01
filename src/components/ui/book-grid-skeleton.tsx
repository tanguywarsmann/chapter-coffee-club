import { Skeleton } from "@/components/ui/skeleton";

interface BookGridSkeletonProps {
  count?: number;
  showTitle?: boolean;
}

export const BookGridSkeleton = ({ count = 8, showTitle = false }: BookGridSkeletonProps) => {
  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="mb-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-3">
            {/* Book cover skeleton */}
            <Skeleton className="w-full aspect-[2/3] bg-coffee-light/30" />
            
            {/* Title skeleton */}
            <Skeleton className="h-4 w-full bg-coffee-light/20" />
            
            {/* Author skeleton */}
            <Skeleton className="h-3 w-3/4 bg-coffee-light/15" />
          </div>
        ))}
      </div>
    </div>
  );
};