
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
  
  // Diagnostic auth détaillé
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[useReadingListPage] useEffect triggered');
      console.log('[AUTH] Context user:', user);
      console.log('[AUTH] Context session:', session);
      
      // Vérifier directement avec Supabase au moment des requêtes
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      console.log('[AUTH] Supabase getUser result:', supabaseUser);
      console.log('[AUTH] Supabase getUser error:', error);
      
      // Vérifier la session Supabase
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      console.log('[AUTH] Supabase session:', supabaseSession);
      console.log('[AUTH] Supabase session access_token:', supabaseSession?.access_token ? 'Present' : 'Missing');
      
      // Test direct d'une requête simple pour voir les headers
      if (supabaseSession?.access_token) {
        console.log('[AUTH] Testing simple query with current session...');
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', supabaseUser?.id)
            .maybeSingle();
          console.log('[AUTH] Profile query result:', { data: profileData, error: profileError });
        } catch (err) {
          console.error('[AUTH] Profile query failed:', err);
        }
      }
    };
    
    checkAuth();
  }, [user, session]);
  
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
