
import { useMemo, useEffect, useRef } from "react";
import { Book } from "@/types/book";
import { StatsCards } from "./StatsCards";
import { CurrentBook } from "./CurrentBook";
import { GoalsPreview } from "./GoalsPreview";
import { ReadingProgress } from "./ReadingProgress";
import { ActivityFeed } from "./ActivityFeed";
import { getUserActivities } from "@/mock/activities";
import { CurrentReadingCard } from "./CurrentReadingCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

interface HomeContentProps {
  currentReading: Book | null;
  isLoadingCurrentBook: boolean;
  currentBook: Book | null;
  inProgressBooks: Book[];
  isLoading: boolean;
  onProgressUpdate: (bookId: string) => void;
  onContinueReading: () => void;
}

export function HomeContent({
  currentReading,
  isLoadingCurrentBook,
  currentBook,
  inProgressBooks,
  isLoading,
  onProgressUpdate,
  onContinueReading
}: HomeContentProps) {
  const isMobile = useIsMobile();
  const renderCount = useRef(0);
  const stableDataRef = useRef({
    currentReadingId: currentReading?.id || null,
    currentBookId: currentBook?.id || null,
    inProgressCount: inProgressBooks?.length || 0
  });
  
  // Logging pour diagnostic seulement en dev
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current++;
      console.log(`[HOME CONTENT DIAGNOSTIQUE] Render count: ${renderCount.current}`);
      
      // Vérifier si les données ont réellement changé
      const newState = {
        currentReadingId: currentReading?.id || null,
        currentBookId: currentBook?.id || null,
        inProgressCount: inProgressBooks?.length || 0
      };
      
      if (JSON.stringify(newState) !== JSON.stringify(stableDataRef.current)) {
        console.log('[HOME CONTENT DIAGNOSTIQUE] Data change detected:', {
          prevState: stableDataRef.current,
          newState
        });
        stableDataRef.current = newState;
      } else {
        console.log('[HOME CONTENT DIAGNOSTIQUE] Re-render with same data');
      }
    }
  });
  
  // Mémoïser les livres en cours valides pour éviter les re-rendus inutiles
  const validInProgressBooks = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[HOME CONTENT DIAGNOSTIQUE] Computing validInProgressBooks from', 
        inProgressBooks?.length || 0, 'books');
    }
    
    return Array.isArray(inProgressBooks) 
      ? inProgressBooks.filter(book => book && !book.isUnavailable)
      : [];
  }, [inProgressBooks]);
  
  // Mémoïser le livre actuel valide
  const validCurrentBook = useMemo(() => {
    return currentBook && !currentBook.isUnavailable ? currentBook : null;
  }, [currentBook]);
  
  // Mémoïser le livre en cours de lecture valide
  const validCurrentReading = useMemo(() => {
    return currentReading && !currentReading.isUnavailable ? currentReading : null;
  }, [currentReading]);
  
  // Mémoïser les activités pour éviter les re-rendus inutiles
  const activities = useMemo(() => getUserActivities(), []);

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="space-y-6 md:col-span-2 lg:col-span-3">
        {isLoadingCurrentBook ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-coffee-dark" />
          </div>
        ) : validCurrentReading ? (
          <CurrentReadingCard
            key={validCurrentReading.id}
            book={validCurrentReading}
            currentPage={validCurrentReading.chaptersRead * 30}
            onContinueReading={onContinueReading}
          />
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrentBook 
            book={validCurrentBook}
            onProgressUpdate={onProgressUpdate} 
          />
          <div className="space-y-6">
            <GoalsPreview />
          </div>
        </div>
        
        <ReadingProgress 
          key={`reading-progress-${validInProgressBooks.length}`}
          inProgressBooks={validInProgressBooks}
          isLoading={isLoading} 
        />
      </div>
      <div className={`${isMobile ? 'mt-6 md:mt-0' : ''}`}>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
