
console.log("Import de useReadingListState.ts OK");

import { useState, useEffect, useRef } from "react";
import { Book } from "@/types/book";
import { useBookSorting } from "./useBookSorting";

export const useReadingListState = () => {
  const [toReadBooks, setToReadBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateBooks = (
    toRead: Book[], 
    inProgress: Book[], 
    completed: Book[]
  ) => {
    if (!isMounted.current) return;
    
    setToReadBooks(sortBooks(toRead, sortBy));
    setInProgressBooks(sortBooks(inProgress, sortBy));
    setCompletedBooks(sortBooks(completed, sortBy));
  };

  return {
    books: {
      toRead: toReadBooks,
      inProgress: inProgressBooks,
      completed: completedBooks
    },
    sortState: {
      sortBy,
      setSortBy
    },
    loading: {
      isLoading,
      setIsLoading,
      isFetching,
      setIsFetching
    },
    error: {
      current: error,
      setError
    },
    updateBooks,
    isMounted
  };
};
