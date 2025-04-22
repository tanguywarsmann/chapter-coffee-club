
import { Progress } from "@/components/ui/progress";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface BookProgressBarProps {
  progressPercent: number;
}

export const BookProgressBar = ({ progressPercent }: BookProgressBarProps) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressPercent > 0 && progressRef.current) {
      setTimeout(() => {
        progressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [progressPercent]);

  return (
    <div ref={progressRef} className="my-3">
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
};
