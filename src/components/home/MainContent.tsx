
import { Book } from "@/types/book";
import { useRef, useEffect, useMemo, memo } from "react";
import { SearchResults } from "@/components/home/SearchResults";
import { StatsCards } from "@/components/home/StatsCards";
import { HomeContent } from "@/components/home/HomeContent";
import { Search } from "lucide-react";
import { ReadingProgress, BookWithProgress } from "@/types/reading";
import { texts } from "@/i18n/texts";
import { useRenderTracker } from "@/utils/performanceTracker";

interface MainContentProps {
  searchResults: Book[] | null;
  onResetSearch: () => void;
  isLoading: boolean;
  isSearching?: boolean;
  isRedirecting?: boolean;
  readingProgress: ReadingProgress[];
  onProgressUpdate: (bookId: string) => void;
  currentReading: BookWithProgress | null;
  isLoadingCurrentBook: boolean;
  onContinueReading: () => void;
}

// Composant mémorisé pour les résultats de recherche
const MemoizedSearchResults = memo(SearchResults);

// Composant mémorisé pour le contenu principal
const MemoizedHomeContent = memo(HomeContent);

export const MainContent = memo(function MainContent({
  searchResults,
  onResetSearch,
  readingProgress,
  isLoading,
  isSearching = false,
  isRedirecting = false,
  onProgressUpdate,
  currentReading,
  isLoadingCurrentBook,
  onContinueReading
}: MainContentProps) {
  // Track des re-rendus pour optimisation
  useRenderTracker('MainContent', {
    hasSearchResults: !!searchResults,
    searchResultsLength: searchResults?.length || 0,
    readingProgressLength: readingProgress?.length || 0,
    isLoading,
    isSearching,
    isRedirecting
  });

  // Mémoriser les IDs stables pour éviter les re-rendus
  const stableIds = useMemo(() => ({
    searchResultsKey: searchResults?.map(book => book.id).join('-') || 'no-search',
    readingProgressKey: readingProgress?.map(p => `${p.book_id}-${p.chaptersRead}`).join('-') || 'no-progress',
    inProgressCount: readingProgress?.length || 0
  }), [searchResults, readingProgress]);

  // Composant de chargement mémorisé
  const loadingComponent = useMemo(() => (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <div className="animate-pulse flex justify-center">
          <Search className="h-8 w-8 text-coffee-dark" />
        </div>
        <p className="text-coffee-dark">{texts.searching}</p>
      </div>
    </div>
  ), []);

  // Contenu principal mémorisé
  const homeContent = useMemo(() => (
    <MemoizedHomeContent
      key={`home-content-${stableIds.readingProgressKey}`}
      readingProgress={readingProgress}
      isLoading={isLoading}
      onProgressUpdate={onProgressUpdate}
    />
  ), [readingProgress, isLoading, onProgressUpdate, stableIds.readingProgressKey]);

  if (isSearching) {
    return loadingComponent;
  }

  if (searchResults) {
    return (
      <MemoizedSearchResults 
        key={stableIds.searchResultsKey}
        searchResults={searchResults} 
        onReset={onResetSearch} 
      />
    );
  }

  return homeContent;
});

export default MainContent;
