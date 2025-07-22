
import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/layout/AppHeader";

interface PageSkeletonProps {
  showHeader?: boolean;
  variant?: "home" | "list" | "profile" | "book";
}

export function PageSkeleton({ showHeader = true, variant = "home" }: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-logo-background animate-fade-in">
      {showHeader && <AppHeader />}
      
      <main className="mx-auto w-full px-4 max-w-none py-4 sm:py-6">
        <div className="max-w-none mx-auto px-2 sm:px-0 mb-6 sm:mb-8">
          {/* Search bar skeleton */}
          <Skeleton className="h-12 w-full rounded-lg mb-6" />
        </div>

        {variant === "home" && (
          <div className="space-y-8">
            {/* Current reading card skeleton */}
            <div className="border border-coffee-light rounded-lg p-4 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-4">
                <Skeleton className="w-20 h-28 rounded" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Progress cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-coffee-light rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {variant === "list" && (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            
            {/* Book grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {variant === "profile" && (
          <div className="space-y-8">
            {/* Profile header skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-12 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {variant === "book" && (
          <div className="space-y-6">
            {/* Book header skeleton */}
            <div className="flex gap-6">
              <Skeleton className="w-32 h-48 rounded" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
