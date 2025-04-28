
import { useState, useCallback, useRef } from "react";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { useReadingList } from "@/hooks/useReadingList";
import { useAuth } from "@/contexts/AuthContext";
import { useBookSorting } from "@/hooks/useBookSorting";

export const useReadingListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getBooksByStatus, 
    isLoadingReadingList, 
    getFailedBookIds,
    readingList,
    hasFetchedInitialData 
  } = useReadingList();
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  
  const [toReadBooks, setToReadBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  
  const isMounted = useRef(true);
  const isFetchingRef = useRef(false);

  const navigateToBook = useCallback((bookId: string) => {
    navigate(`/books/${bookId}`);
  }, [navigate]);

  const fetchBooks = useCallback(async () => {
    if (!user?.id || !readingList || isFetchingRef.current) return;
    
    if (hasFetchedInitialData() && !isLoadingReadingList && 
        ((toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0) || 
         (readingList && Array.isArray(readingList) && readingList.length === 0))) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsFetching(true);
    isFetchingRef.current = true;
    
    try {
      const failedIds = getFailedBookIds ? getFailedBookIds() : [];
      failedIds.forEach(id => unavailableBookIds.add(id));
      
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
      
      if (isMounted.current) {
        const stabilizeBooks = (books: Book[]) => {
          return books.map(book => {
            if (book.isUnavailable || unavailableBookIds.has(book.id)) {
              unavailableBookIds.add(book.id);
              return {
                ...book,
                isUnavailable: true,
                isStableUnavailable: true
              };
            }
            return book;
          });
        };
        
        setToReadBooks(sortBooks(stabilizeBooks(toReadResult || []), sortBy));
        setInProgressBooks(sortBooks(stabilizeBooks(inProgressResult || []), sortBy));
        setCompletedBooks(sortBooks(stabilizeBooks(completedResult || []), sortBy));
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err as any);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
      isFetchingRef.current = false;
    }
  }, [user?.id, getBooksByStatus, sortBy, sortBooks, isFetching, getFailedBookIds, hasFetchedInitialData, isLoadingReadingList, readingList]);

  return {
    user,
    books: {
      toRead: toReadBooks,
      inProgress: inProgressBooks,
      completed: completedBooks
    },
    loading: {
      isLoading,
      isLoadingReadingList,
      isFetching
    },
    error,
    sortBy,
    setSortBy,
    navigateToBook,
    fetchBooks
  };
};
