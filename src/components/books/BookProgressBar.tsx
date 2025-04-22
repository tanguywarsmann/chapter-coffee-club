
import { Progress } from "@/components/ui/progress";
import { ChevronDown } from "lucide-react";
import { forwardRef, useEffect, ForwardedRef } from "react";

interface BookProgressBarProps {
  progressPercent: number;
}

export const BookProgressBar = forwardRef<HTMLDivElement, BookProgressBarProps>(
  ({ progressPercent }, ref) => {
    useEffect(() => {
      if (progressPercent > 0 && ref && typeof ref !== 'function' && ref.current) {
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
      }
    }, [progressPercent, ref]);

    return (
      <div ref={ref} className="my-3">
        <div className="flex items-center gap-2">
          <Progress value={progressPercent} />
          <span className="text-xs font-medium text-coffee-darker">{progressPercent}%</span>
        </div>
        {progressPercent > 0 && progressPercent < 100 && (
          <div className="flex justify-center mt-1 animate-bounce">
            <ChevronDown className="h-4 w-4 text-coffee-medium opacity-60" />
          </div>
        )}
      </div>
    );
  }
);

BookProgressBar.displayName = "BookProgressBar";
