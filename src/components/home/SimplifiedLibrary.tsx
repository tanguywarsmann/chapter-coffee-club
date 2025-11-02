import { memo } from "react";
import { ReadingProgress } from "@/types/reading";
import { BookOpen, ChevronRight } from "lucide-react";
import Image from "@/components/ui/image";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimplifiedLibraryProps {
  progressItems: ReadingProgress[];
  isLoading: boolean;
}

export const SimplifiedLibrary = memo(function SimplifiedLibrary({
  progressItems,
  isLoading,
}: SimplifiedLibraryProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Show max 6 books, rest go to "See All"
  const displayedBooks = progressItems.slice(0, 6);
  const hasMore = progressItems.length > 6;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-xl md:text-2xl font-serif font-medium text-coffee-darker">
          Ma bibliothèque
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="aspect-[2/3] bg-muted rounded-lg" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!progressItems || progressItems.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-8 text-center space-y-4">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-serif font-medium text-coffee-darker">
              Aucun livre en cours
            </h3>
            <p className="text-base text-muted-foreground">
              Explorez notre catalogue pour commencer votre lecture
            </p>
          </div>
          <Button
            onClick={() => navigate("/discover")}
            className="bg-coffee-dark hover:bg-coffee-darker text-white rounded-xl"
          >
            Découvrir des livres
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif font-medium text-coffee-darker">
          Ma bibliothèque
        </h2>
        {hasMore && !isMobile && (
          <Button
            variant="ghost"
            onClick={() => navigate("/library")}
            className="text-coffee-dark hover:text-coffee-darker hover:bg-accent/10 transition-colors"
          >
            Voir tout
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedBooks.map((item) => {
          if (!item.id) return null;

          const imageSrc = item.cover_url || item.book_cover;
          const totalChapters = item.totalChapters || item.total_chapters || 100;
          const progressPercentage = Math.round((item.chaptersRead / totalChapters) * 100);

          return (
            <div
              key={item.id}
              onClick={() => navigate(`/books/${item.id}?segment=${Math.floor(item.chaptersRead)}`)}
              className="group cursor-pointer space-y-2 hover:scale-[1.02] transition-all duration-300"
            >
              {/* Book Cover */}
              <div className="aspect-[2/3] relative overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-3xl font-serif italic text-coffee-dark">
                      {item.title.substring(0, 1)}
                    </span>
                  </div>
                )}
                
                {/* Progress Badge */}
                {progressPercentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <Progress value={progressPercentage} className="h-1 bg-white/30" />
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="space-y-1">
                <h3 className="text-sm md:text-base font-medium text-coffee-darker line-clamp-2 group-hover:text-coffee-dark transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                  {item.author}
                </p>
                <p className="text-xs text-muted-foreground">
                  {progressPercentage}% complété
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile "See All" Button */}
      {hasMore && isMobile && (
        <Button
          onClick={() => navigate("/library")}
          variant="outline"
          className="w-full rounded-xl border-coffee-light text-coffee-dark hover:bg-accent/10"
        >
          Voir tous les {progressItems.length} livres
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
});
