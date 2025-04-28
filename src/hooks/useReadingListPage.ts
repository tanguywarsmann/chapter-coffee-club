
import { useState, useCallback } from "react";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { useReadingList } from "@/hooks/useReadingList";
import { useAuth } from "@/contexts/AuthContext";
import { useBookSorting } from "@/hooks/useBookSorting";
import { useBookFetching } from "./useBookFetching";

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

  const { isLoading, isFetching, error, fetchBooks } = useBookFetching({
    user,
    readingList,
    getBooksByStatus,
    sortBooks,
    sortBy
  });

  const navigateToBook = useCallback((bookId: string) => {
    navigate(`/books/${bookId}`);
  }, [navigate]);

  const handleFetchBooks = useCallback(async () => {
    await fetchBooks(
      setToReadBooks,
      setInProgressBooks,
      setCompletedBooks,
      hasFetchedInitialData,
      isLoadingReadingList
    );
  }, [fetchBooks, hasFetchedInitialData, isLoadingReadingList]);

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
    fetchBooks: handleFetchBooks
  };
};
