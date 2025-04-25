
import { Book } from "@/types/book";
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
  onProgressUpdate,
  onContinueReading
}: MainContentProps) {
  if (searchResults) {
    return (
      <SearchResults 
        searchResults={searchResults} 
        onReset={onResetSearch} 
      />
    );
  }

  return (
    <>
      <StatsCards />
      <HomeContent
        currentReading={currentReading}
        isLoadingCurrentBook={isLoadingCurrentBook}
        currentBook={currentBook}
        inProgressBooks={inProgressBooks}
        isLoading={isLoading}
        onProgressUpdate={onProgressUpdate}
        onContinueReading={onContinueReading}
      />
    </>
  );
}
