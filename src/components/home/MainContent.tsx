import { Book } from "@/types/book";
import { useRef, useEffect, useMemo } from "react";
import { SearchResults } from "@/components/home/SearchResults";
import { StatsCards } from "@/components/home/StatsCards";
import { HomeContent } from "@/components/home/HomeContent";
import { Search } from "lucide-react";
import { ReadingProgress } from "@/types/reading";

interface MainContentProps {
  searchResults: Book[] | null;
  onResetSearch: () => void;
  isLoading: boolean;
  isSearching?: boolean;
  isRedirecting?: boolean;
  readingProgress: ReadingProgress[];
  onProgressUpdate: (bookId: string) => void;
}

export function MainContent({
  searchResults,
  onResetSearch,
  readingProgress,
  isLoading,
  isSearching = false,
  isRedirecting = false,
  onProgressUpdate
}: MainContentProps) {
  const renderCount = useRef(0);

  const stableIds = useMemo(() => ({
    inProgressCount: readingProgress?.length || 0
  }), [readingProgress?.length]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current++;
      console.log(`[MAIN CONTENT DIAGNOSTIQUE] Render #${renderCount.current}`, {
        hasSearchResults: !!searchResults,
        inProgressCount: stableIds.inProgressCount,
        isLoading,
        isSearching,
        isRedirecting
      });
    }
  });

  const homeContent = useMemo(() => (
    <>
      <HomeContent
        key={`home-content-${stableIds.inProgressCount}`}
        readingProgress={readingProgress}
        isLoading={isLoading}
        onProgressUpdate={onProgressUpdate}
      />
    </>
  ), [
    readingProgress, 
    isLoading, 
    onProgressUpdate,
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

  if (isRedirecting && searchResults && searchResults.length === 1) {
    return (
      <div className="animate-fade-out transition-all duration-300 ease-in-out">
        <SearchResults 
          searchResults={searchResults} 
          onReset={onResetSearch}
          redirecting={true}
        />
        <div className="mt-6 text-center text-coffee-dark animate-pulse">
          <p>Redirection vers {searchResults[0].title}...</p>
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
