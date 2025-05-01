
import { Book } from "@/types/book";
import { useRef, useEffect, useMemo } from "react";
import { SearchResults } from "@/components/home/SearchResults";
import { StatsCards } from "@/components/home/StatsCards";
import { HomeContent } from "@/components/home/HomeContent";

interface MainContentProps {
  searchResults: Book[] | null;
  onResetSearch: () => void;
  currentReading: Book | null;
  isLoadingCurrentBook: boolean;
  currentBook: Book | null;
  inProgressBooks: Book[];
  isLoading: boolean;
  isSearching?: boolean;
  onProgressUpdate: (bookId: string) => void;
  onContinueReading: () => void;
}

export function MainContent({
  searchResults,
  onResetSearch,
  currentReading,
  isLoadingCurrentBook,
  currentBook,
  inProgressBooks,
  isLoading,
  isSearching = false,
  onProgressUpdate,
  onContinueReading
}: MainContentProps) {
  const renderCount = useRef(0);
  
  // Memoize the current reading ID for stable comparisons
  const stableIds = useMemo(() => ({
    currentReadingId: currentReading?.id || null,
    currentBookId: currentBook?.id || null,
    inProgressCount: inProgressBooks?.length || 0
  }), [currentReading?.id, currentBook?.id, inProgressBooks?.length]);
  
  // Logging pour diagnostic
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current++;
      console.log(`[MAIN CONTENT DIAGNOSTIQUE] Render #${renderCount.current}`, {
        hasSearchResults: !!searchResults,
        currentReadingId: stableIds.currentReadingId,
        currentBookId: stableIds.currentBookId,
        inProgressBooksCount: stableIds.inProgressCount,
        isLoadingCurrentBook,
        isLoading,
        isSearching
      });
    }
  });

  // Memoize the home content to prevent unnecessary re-renders
  const homeContent = useMemo(() => (
    <>
      <StatsCards />
      <HomeContent
        key={`home-content-${stableIds.currentReadingId || 'none'}`}
        currentReading={currentReading}
        isLoadingCurrentBook={isLoadingCurrentBook}
        currentBook={currentBook}
        inProgressBooks={inProgressBooks}
        isLoading={isLoading}
        onProgressUpdate={onProgressUpdate}
        onContinueReading={onContinueReading}
      />
    </>
  ), [
    currentReading, 
    isLoadingCurrentBook, 
    currentBook, 
    inProgressBooks, 
    isLoading, 
    onProgressUpdate, 
    onContinueReading,
    stableIds
  ]);

  if (isSearching) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-pulse flex justify-center">
            <Search className="h-8 w-8 text-coffee-dark" />
          </div>
          <p className="text-coffee-dark">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  if (searchResults) {
    return (
      <SearchResults 
        searchResults={searchResults} 
        onReset={onResetSearch} 
      />
    );
  }

  return homeContent;
}
