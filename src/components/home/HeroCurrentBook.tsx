import { memo } from "react";
import { BookWithProgress } from "@/types/reading";
import { Button } from "@/components/ui/button";
import { Book, Sparkles } from "lucide-react";
import Image from "@/components/ui/image";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/LanguageContext";

interface HeroCurrentBookProps {
  currentReading: BookWithProgress | null;
  isLoading: boolean;
  onContinueReading: () => void;
}

export const HeroCurrentBook = memo(function HeroCurrentBook({
  currentReading,
  isLoading,
  onContinueReading,
}: HeroCurrentBookProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8 md:p-10 min-h-[320px] flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-48 w-36 bg-muted rounded-xl mx-auto" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentReading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-10 md:p-14 min-h-[320px] flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full" />
            <Book className="relative h-20 w-20 text-brand-600" />
            <Sparkles className="h-7 w-7 text-brand-500 absolute -top-2 -right-2 animate-glow" />
          </div>
          <div className="space-y-3">
            <h2 className="text-h1 font-serif font-semibold text-brand-900">
              {t.home.startLiteraryJourney}
            </h2>
            <p className="text-body-lg text-muted-foreground max-w-md">
              {t.home.discoverCollection}
            </p>
          </div>
          <Button
            onClick={() => navigate("/explore?cat=litterature")}
            variant="premium"
            size="lg"
            className="px-10 py-6 text-lg"
          >
            <span className="relative z-10">{t.home.discoverBooks}</span>
          </Button>
        </div>
      </div>
    );
  }

  const imageSrc = currentReading.cover_url || currentReading.book_cover;
  const progressPercentage = Math.round((currentReading.chaptersRead / (currentReading.totalChapters || currentReading.total_chapters || 100)) * 100);

  return (
    <div className="animate-fade-in">
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 md:p-10 min-h-[320px]">
        <h2 className="text-h2 font-serif font-medium text-brand-900 mb-8">
          {t.home.currentReading}
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Book Cover with reflection */}
          <div className="flex-shrink-0 group cursor-pointer relative" onClick={onContinueReading}>
            {imageSrc ? (
              <div className="relative">
                <Image
                  src={imageSrc}
                  alt={currentReading.title}
                  className="w-36 h-54 object-cover rounded-xl shadow-2xl group-hover:scale-[1.03] transition-transform duration-300"
                  priority
                  sizes="144px"
                />
                {/* Reflection effect */}
                <div className="absolute -bottom-4 left-0 right-0 h-20 bg-gradient-to-b from-black/5 to-transparent blur-xl" />
              </div>
            ) : (
              <div className="w-36 h-54 flex items-center justify-center bg-muted rounded-xl shadow-2xl">
                <span className="text-5xl font-serif italic text-brand-600">
                  {currentReading.title.substring(0, 1)}
                </span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 w-full space-y-5">
            <div>
              <h3 
                className="text-h2 font-serif font-semibold text-brand-900 mb-2 cursor-pointer hover:text-brand-700 transition-colors"
                onClick={onContinueReading}
              >
                {currentReading.title}
              </h3>
              <p className="text-body-lg text-muted-foreground">
                {currentReading.author}
              </p>
            </div>

            {/* Progress with gradient */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                <span>{t.home.progression}</span>
                <span className="font-semibold text-brand-700 text-body">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-body-sm text-muted-foreground">
                {Math.floor(currentReading.chaptersRead)} / {currentReading.totalChapters || currentReading.total_chapters || 0} {t.home.segmentsValidated}
              </p>
            </div>

            {/* CTA Button */}
            <Button
              onClick={onContinueReading}
              variant="premium"
              className="w-full py-7 text-lg font-semibold"
            >
              <span className="relative z-10">{t.home.continueReading}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
