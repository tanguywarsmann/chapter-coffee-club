
import { Progress } from "@/components/ui/progress";
import { ChevronDown, Sparkles } from "lucide-react";
import { forwardRef, useEffect, ForwardedRef } from "react";
import { useTranslation } from "@/i18n/LanguageContext";

interface BookProgressBarProps {
  progressPercent: number;
  jokersUsed?: number;
  jokersAllowed?: number;
}

export const BookProgressBar = forwardRef<HTMLDivElement, BookProgressBarProps>(
  ({ progressPercent, jokersUsed = 0, jokersAllowed = 0 }, ref) => {
    const { t } = useTranslation();

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
          <span className="text-caption font-medium text-coffee-darker">{progressPercent}%</span>
        </div>
        
        {jokersAllowed > 0 && (
          <div className="flex items-center justify-center gap-1 mt-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="text-caption text-muted-foreground">
              {t.bookProgressBar.jokersUsed
                .replace("{used}", String(jokersUsed))
                .replace("{total}", String(jokersAllowed))}
            </span>
          </div>
        )}
        
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
