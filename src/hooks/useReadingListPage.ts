
import { useState, useCallback, useEffect, useRef } from "react";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { useReadingList } from "@/hooks/useReadingList";
import { useAuth } from "@/contexts/AuthContext";
import { useBookSorting } from "@/hooks/useBookSorting";
import { useBookFetching } from "./useBookFetching";
import { useIsMobile } from "@/hooks/use-mobile";

export const useReadingListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const isMobile = useIsMobile();
  
  const { 
    getBooksByStatus, 
    isLoadingReadingList, 
    readingList
  } = useReadingList();
  
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  
  const [toReadBooks, setToReadBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [hasInitialFetch, setHasInitialFetch] = useState<boolean>(false);

  // Use useBookFetching with the correct signature
  const { 
    isLoading, 
    isFetching, 
    error,
    refetch,
    hasLoaded
  } = useBookFetching();

  // Effect to track data state and update isDataReady
  useEffect(() => {
    try {
      if (!isLoadingReadingList && !isFetching && hasInitialFetch) {
        // Mark data as ready when loading is complete (even if no books)
        setIsDataReady(true);
      }
    } catch (e) {
      console.error("Error in useEffect for isDataReady:", e);
    }
  }, [isLoadingReadingList, isFetching, hasInitialFetch]);

  const navigateToBook = useCallback((bookId: string) => {
    try {
      if (!bookId) {
        console.warn("navigateToBook called with empty or null bookId");
        return;
      }
      if (typeof window !== "undefined") {
        navigate(`/books/${bookId}`);
      }
    } catch (e) {
      console.error("Error in navigateToBook:", e);
    }
  }, [navigate]);

  const handleFetchBooks = useCallback(async () => {
    // Only fetch if userId exists and we haven't fetched yet
    if (!userId || hasInitialFetch) {
      return;
    }
    
    try {
      console.log("[DEBUG] Fetching books for userId:", userId);
      
      // Fetch all categories
      const [toRead, inProgress, completed] = await Promise.all([
        getBooksByStatus('to_read'),
        getBooksByStatus('in_progress'),
        getBooksByStatus('completed')
      ]);
      
      console.log("[DEBUG] Fetched books:", {
        toRead: toRead?.length || 0,
        inProgress: inProgress?.length || 0,
        completed: completed?.length || 0
      });
      
      // Apply sorting and update state
      setToReadBooks(sortBooks(toRead || [], sortBy));
      setInProgressBooks(sortBooks(inProgress || [], sortBy));
      setCompletedBooks(sortBooks(completed || [], sortBy));
      setHasInitialFetch(true);
    } catch (error) {
      console.error("Error fetching books:", error);
      setHasInitialFetch(true); // Mark as fetched even on error to avoid infinite loops
    }
  }, [getBooksByStatus, userId, hasInitialFetch, sortBooks, sortBy]);

  // Single effect to handle initial fetch
  useEffect(() => {
    if (userId && readingList && !hasInitialFetch && !isLoadingReadingList && !isFetching) {
      handleFetchBooks();
    }
  }, [userId, readingList, hasInitialFetch, isLoadingReadingList, isFetching, handleFetchBooks]);

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
      isFetching,
      isDataReady
    },
    error,
    sortBy,
    setSortBy,
    navigateToBook,
    fetchBooks: handleFetchBooks,
    isMobile // Add this to allow components to check if mobile view is active
  };
};
