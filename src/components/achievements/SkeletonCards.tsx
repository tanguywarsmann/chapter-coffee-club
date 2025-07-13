export function SkeletonCards() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-xl" />
            <div className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="h-3 bg-reed-light/50 rounded-full w-24 mb-3 animate-pulse" />
                  <div className="h-8 bg-reed-light/50 rounded-full w-16 animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-reed-light/50 rounded-2xl animate-pulse flex-shrink-0" />
              </div>
              <div className="mt-6 h-1 bg-reed-light/50 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Streak Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-xl" />
            <div className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 bg-reed-light/50 rounded-2xl animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3 bg-reed-light/50 rounded-full w-20 mb-2 animate-pulse" />
                  <div className="h-6 bg-reed-light/50 rounded-full w-32 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level Card Skeleton */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-xl" />
        <div className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 bg-reed-light/50 rounded-2xl animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-3 bg-reed-light/50 rounded-full w-16 mb-2 animate-pulse" />
              <div className="h-5 bg-reed-light/50 rounded-full w-24 mb-3 animate-pulse" />
              <div className="h-2 bg-reed-light/50 rounded-full w-full mb-1 animate-pulse" />
              <div className="h-2 bg-reed-light/50 rounded-full w-32 animate-pulse" />
            </div>
            <div className="w-4 h-4 bg-reed-light/50 rounded animate-pulse flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}