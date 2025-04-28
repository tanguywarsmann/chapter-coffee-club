
import { useState, useRef } from "react";
import { Book } from "@/types/book";
import { ReadingProgress } from "@/types/reading";
import { useBookStabilization } from "./useBookStabilization";
import { bookFailureCache } from "@/utils/bookFailureCache";
import { unavailableBooksCache } from "@/utils/unavailableBooksCache";
import { SortOption } from "@/components/reading/BookSortSelect";

interface UseBookFetchingProps {
  user: { id: string } | null;
  readingList: ReadingProgress[] | null;
  getBooksByStatus: (status: string) => Promise<Book[]>;
  sortBooks: (books: Book[], sortOption: SortOption) => Book[];
  sortBy: SortOption;
}

export const useBookFetching = ({
  user,
  readingList,
  getBooksByStatus,
  sortBooks,
  sortBy
}: UseBookFetchingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isFetchingRef = useRef(false);
  const { stabilizeBooks } = useBookStabilization();

  const fetchBooks = async (
    setToReadBooks: (books: Book[]) => void,
    setInProgressBooks: (books: Book[]) => void,
    setCompletedBooks: (books: Book[]) => void,
    hasFetchedInitialData: () => boolean,
    isLoadingReadingList: boolean
  ) => {
    if (!user?.id || !readingList || isFetchingRef.current) return;
    
    if (hasFetchedInitialData() && !isLoadingReadingList) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsFetching(true);
    isFetchingRef.current = true;
    
    try {
      const failedIds = bookFailureCache.getAll();
      failedIds.forEach(id => unavailableBooksCache.add(id));
      
      if (!readingList || !Array.isArray(readingList) || readingList.length === 0) {
        setToReadBooks([]);
        setInProgressBooks([]);
        setCompletedBooks([]);
        setIsLoading(false);
        setIsFetching(false);
        return;
      }
      
      const [toReadResult, inProgressResult, completedResult] = await Promise.all([
        getBooksByStatus("to_read"),
        getBooksByStatus("in_progress"),
        getBooksByStatus("completed")
      ]);
      
      setToReadBooks(sortBooks(stabilizeBooks(toReadResult || []), sortBy));
      setInProgressBooks(sortBooks(stabilizeBooks(inProgressResult || []), sortBy));
      setCompletedBooks(sortBooks(stabilizeBooks(completedResult || []), sortBy));
      
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  };

  return {
    isLoading,
    isFetching,
    error,
    fetchBooks
  };
};
