
import { Book } from "@/types/book";
import { useMemo, memo } from "react";
import { SearchResults } from "@/components/home/SearchResults";
import { HeroCurrentBook } from "@/components/home/HeroCurrentBook";
import { ExploreSection } from "@/components/home/ExploreSection";
import { BookyWidget } from "@/components/booky/BookyWidget";
import { Search } from "lucide-react";
import { ReadingProgress, BookWithProgress } from "@/types/reading";
import { texts } from "@/i18n/texts";

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
  onSearch: (query: string) => void;
}

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
  onContinueReading,
  onSearch
}: MainContentProps) {
  // Loading state for search
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

  if (isSearching) {
    return loadingComponent;
  }

  if (searchResults) {
    return (
      <SearchResults 
        searchResults={searchResults} 
        onReset={onResetSearch} 
      />
    );
  }

  // Main home layout - simplified and elegant
  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Section - Current Reading */}
      <HeroCurrentBook
        currentReading={currentReading}
        isLoading={isLoadingCurrentBook || isLoading}
        onContinueReading={onContinueReading}
      />

      {readingProgress && readingProgress.length > 0 && (
        <div className="bg-white/50 backdrop-blur rounded-2xl border border-white/30 px-6 py-4 text-center text-sm text-muted-foreground">
          {readingProgress.length === 1
            ? "1 lecture en cours. Continuez votre livre !"
            : `${readingProgress.length} lectures en cours. Continuez votre livre !`}
        </div>
      )}

      {/* Booky Widget - Companion Progress */}
      <BookyWidget />

      {/* Explore Section - Collapsible */}
      <ExploreSection
        onSearch={onSearch}
        isSearching={isSearching}
      />
    </div>
  );
});

export default MainContent;
