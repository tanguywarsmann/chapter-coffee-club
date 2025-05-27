
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  shimmer = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        shimmer && "animate-shimmer loading-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
