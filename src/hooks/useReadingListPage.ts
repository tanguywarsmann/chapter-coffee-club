
import { useState, useCallback, useEffect, useRef } from "react";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { useReadingList } from "@/hooks/useReadingList";
import { useAuth } from "@/contexts/AuthContext";
import { useBookSorting } from "@/hooks/useBookSorting";
import { useBookFetching } from "./useBookFetching";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

export const useReadingListPage = () => {
  console.log('[useReadingListPage] Hook called');
  
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const userId = user?.id;
  const isMobile = useIsMobile();
  
  console.log('[useReadingListPage] User:', user, 'UserId:', userId);
  console.log('[useReadingListPage] Session:', session);
  console.log('[useReadingListPage] Session access token:', session?.access_token);
  
  
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
    console.log('[useReadingListPage] Data ready check:', {
      isLoadingReadingList,
      isFetching,
      hasInitialFetch,
      isDataReady
    });
    
    try {
      if (!isLoadingReadingList && !isFetching && hasInitialFetch) {
        console.log('[useReadingListPage] Setting data as ready');
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
      
      // Use the new fetchReadingProgress service
      const { fetchReadingProgress } = await import("@/services/reading/readingListService");
      const payload = await fetchReadingProgress(userId);
      
      console.log("[DEBUG] Fetched books:", {
        toRead: payload.toReadCount,
        inProgress: payload.inProgressCount,
        completed: payload.completedCount
      });
      
      // Convert to the expected Book format and apply sorting
      const convertToBooks = (rows: any[]) => rows.map((row: any) => ({
        id: row.books?.id || row.book_id,
        title: row.books?.title || 'Titre inconnu',
        author: row.books?.author || 'Auteur inconnu',
        description: row.books?.description || '',
        coverImage: row.books?.cover_url || '',
        cover_url: row.books?.cover_url || '',
        pages: row.books?.total_pages || 0,
        categories: row.books?.tags || [],
        tags: row.books?.tags || [],
        totalChapters: row.books?.expected_segments || 0,
        language: 'fr',
        publicationYear: new Date().getFullYear(),
        slug: row.books?.slug || row.books?.id || row.book_id,
        isCompleted: row.status === 'completed',
        expectedSegments: row.books?.expected_segments || 0,
      }));
      
      const toReadBooks = convertToBooks(payload.toRead);
      const inProgressBooks = convertToBooks(payload.inProgress);
      const completedBooks = convertToBooks(payload.completed);
      
      // Apply sorting and update state
      setToReadBooks(sortBooks(toReadBooks, sortBy));
      setInProgressBooks(sortBooks(inProgressBooks, sortBy));
      setCompletedBooks(sortBooks(completedBooks, sortBy));
      setHasInitialFetch(true);
    } catch (error) {
      console.error("Error fetching books:", error);
      setHasInitialFetch(true); // Mark as fetched even on error to avoid infinite loops
    }
  }, [userId, hasInitialFetch, sortBooks, sortBy]);

  // Single effect to handle initial fetch with proper completion handling
  useEffect(() => {
    if (!userId) {
      console.log("⚪ [ReadingListPage] no user, finishing empty");
      setIsDataReady(true);
      setHasInitialFetch(true);
      return;
    }

    if (userId && readingList && !hasInitialFetch && !isLoadingReadingList && !isFetching) {
      handleFetchBooks().finally(() => {
        // Always mark as complete even if fetch fails
        setIsDataReady(true);
        setHasInitialFetch(true);
      });
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
