import { memo } from "react";
import { BookWithProgress } from "@/types/reading";
import { Button } from "@/components/ui/button";
import { Book, Sparkles } from "lucide-react";
import Image from "@/components/ui/image";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

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

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 min-h-[280px] flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-32 w-24 bg-muted rounded mx-auto" />
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 md:p-12 min-h-[280px] flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <Book className="h-16 w-16 text-coffee-dark" />
            <Sparkles className="h-6 w-6 text-accent absolute -top-2 -right-2 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-coffee-darker">
              Commencez votre voyage littéraire
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Découvrez notre collection de classiques et commencez à lire dès aujourd'hui
            </p>
          </div>
          <Button
            onClick={() => navigate("/discover")}
            size="lg"
            className="bg-coffee-dark hover:bg-coffee-darker text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Découvrir des livres
          </Button>
        </div>
      </div>
    );
  }

  const imageSrc = currentReading.cover_url || currentReading.book_cover;
  const progressPercentage = Math.round((currentReading.chaptersRead / (currentReading.totalChapters || currentReading.total_chapters || 100)) * 100);

  return (
    <div className="animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 md:p-8 min-h-[280px]">
        <h2 className="text-xl md:text-2xl font-serif font-medium text-coffee-darker mb-6">
          Votre lecture en cours
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0 group cursor-pointer" onClick={onContinueReading}>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={currentReading.title}
                className="w-28 h-40 md:w-32 md:h-48 object-cover rounded-lg shadow-md group-hover:scale-[1.02] transition-transform duration-300"
                priority
                sizes="(max-width: 768px) 112px, 128px"
              />
            ) : (
              <div className="w-28 h-40 md:w-32 md:h-48 flex items-center justify-center bg-muted rounded-lg shadow-md">
                <span className="text-4xl font-serif italic text-coffee-dark">
                  {currentReading.title.substring(0, 1)}
                </span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <h3 
                className="text-xl md:text-2xl font-serif font-semibold text-coffee-darker mb-1 cursor-pointer hover:text-coffee-dark transition-colors"
                onClick={onContinueReading}
              >
                {currentReading.title}
              </h3>
              <p className="text-base md:text-lg text-muted-foreground">
                {currentReading.author}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Progression</span>
                <span className="font-medium text-coffee-darker">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {Math.floor(currentReading.chaptersRead)} / {currentReading.totalChapters || currentReading.total_chapters || 0} segments validés
              </p>
            </div>

            {/* CTA Button */}
            <Button
              onClick={onContinueReading}
              className="w-full bg-coffee-dark hover:bg-coffee-darker text-white rounded-xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              Continuer la lecture
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
