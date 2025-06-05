
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

  // Add reference to track if initial fetch was triggered
  const initialFetchTriggered = useRef(false);
  // New reference to track if the first userId-specific useEffect has been executed
  const initialUserIdFetchDone = useRef(false);

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
      if (!isLoading && !isFetching) {
        // Mark data as ready only when loading is complete
        // and at least one of the lists contains data
        const hasData = toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0;
        setIsDataReady(hasData);
      }
    } catch (e) {
      console.error("Error in useEffect for isDataReady:", e);
    }
  }, [toReadBooks, inProgressBooks, completedBooks, isLoading, isFetching]);

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
    // Only fetch if no loading is in progress and userId exists
    if (!userId || isFetching || isLoading) {
      return;
    }

    // If data is already loaded, don't refetch
    if (toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0) {
      return;
    }
    
    try {
      console.log("[DEBUG] Fetching books for mobile:", isMobile, "userId:", userId);
      
      // Fetch all categories regardless of device type
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
      
      // Apply sorting
      setToReadBooks(sortBooks(toRead || [], sortBy));
      setInProgressBooks(sortBooks(inProgress || [], sortBy));
      setCompletedBooks(sortBooks(completed || [], sortBy));
    } catch (error) {
      console.error("Error fetching books:", error);
    }
    
  }, [
    getBooksByStatus, 
    userId,
    isFetching,
    isLoading,
    toReadBooks.length,
    inProgressBooks.length,
    completedBooks.length,
    sortBooks,
    sortBy,
    isMobile
  ]);

  // NEW EFFECT: Watch specifically ONLY for userId appearance
  // without depending on the lists to avoid loops
  useEffect(() => {
    if (userId && !initialUserIdFetchDone.current) {
      initialUserIdFetchDone.current = true;
      
      // Check if lists are empty before triggering fetch
      if (toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
        handleFetchBooks();
      }
    }
  }, [userId, handleFetchBooks, toReadBooks.length, inProgressBooks.length, completedBooks.length]);

  // NEW EFFECT: Watch specifically for userId appearance
  // and trigger initial fetch if needed
  useEffect(() => {
    if (userId && !initialFetchTriggered.current && !isLoading && !isFetching) {
      initialFetchTriggered.current = true;
      handleFetchBooks();
    }
  }, [userId, handleFetchBooks, isLoading, isFetching]);

  // Mount effect for first data retrieval
  useEffect(() => {
    // Only trigger if userId exists, no loading is in progress and there's no data yet
    if (userId && !isLoading && !isFetching && 
       toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
      handleFetchBooks();
    }
  }, [userId, handleFetchBooks, isLoading, isFetching, toReadBooks.length, inProgressBooks.length, completedBooks.length]);

  // Effect for readingList changes
  useEffect(() => {
    if (userId && readingList && !isLoading && !isFetching) {
      // Only trigger if readingList actually changes
      handleFetchBooks();
    }
  }, [userId, readingList, handleFetchBooks, isLoading, isFetching]);

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
