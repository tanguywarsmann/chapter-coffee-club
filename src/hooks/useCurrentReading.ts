
import { useState, useRef, useEffect, useMemo } from "react";
import { Book } from "@/types/book";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingList } from "@/hooks/useReadingList";
import { toast } from "sonner";

export const useCurrentReading = () => {
  const { user } = useAuth();
  const { getBooksByStatus, readingList, inProgress } = useReadingList();
  const [currentReading, setCurrentReading] = useState<Book | null>(null);
  const [isLoadingCurrentBook, setIsLoadingCurrentBook] = useState(true);
  const isMounted = useRef(true);
  const fetchingCurrentReading = useRef(false);
  const lastFetchedId = useRef<string | null>(null);
  
  // Memorize the current reading book based on inProgress books if available
  const memoizedCurrentReading = useMemo(() => {
    if (inProgress && inProgress.length > 0) {
      const availableBooks = inProgress.filter(book => !book.isUnavailable);
      if (availableBooks.length > 0) {
        return availableBooks[0];
      } else if (inProgress.length > 0) {
        // Mark as stable unavailable if all books are unavailable
        return {
          ...inProgress[0],
          isStableUnavailable: true
        };
      }
    }
    return null;
  }, [inProgress]);
  
  // Update state from memoized value only when it changes
  useEffect(() => {
    if (isMounted.current && memoizedCurrentReading) {
      const currentId = currentReading?.id;
      const newId = memoizedCurrentReading.id;
      
      if (currentId !== newId || !currentReading) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[CURRENT READING DIAGNOSTIQUE] Updating from memoized value:', {
            from: currentId,
            to: newId
          });
        }
        setCurrentReading(memoizedCurrentReading);
        setIsLoadingCurrentBook(false); // We already have the book, so not loading
      }
    }
  }, [memoizedCurrentReading, currentReading]);

  useEffect(() => {
    const fetchCurrentReading = async () => {
      if (!user?.id || fetchingCurrentReading.current) return;
      
      // If we already have a reading, don't fetch again unless forced
      if (inProgress && inProgress.length > 0 && !fetchingCurrentReading.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[CURRENT READING DIAGNOSTIQUE] Using in-memory progress books');
        }
        return;
      }
      
      // Exit if we've already fetched this user's books recently
      if (user.id === lastFetchedId.current && currentReading) {
        setIsLoadingCurrentBook(false);
        return;
      }
      
      try {
        fetchingCurrentReading.current = true;
        setIsLoadingCurrentBook(true);
        const inProgressBooks = await getBooksByStatus("in_progress");
        
        if (!isMounted.current) return;
        
        if (inProgressBooks && inProgressBooks.length > 0) {
          const availableBooks = inProgressBooks.filter(book => !book.isUnavailable);
          if (availableBooks.length > 0) {
            setCurrentReading(availableBooks[0]);
          } else if (inProgressBooks.length > 0) {
            const stableUnavailableBook = {
              ...inProgressBooks[0],
              isStableUnavailable: true
            };
            setCurrentReading(stableUnavailableBook);
          } else {
            setCurrentReading(null);
          }
        } else {
          setCurrentReading(null);
        }
        
        // Record that we fetched for this user
        lastFetchedId.current = user.id;
      } catch (error) {
        console.error("Error fetching current reading:", error);
        if (isMounted.current) {
          toast.error("Impossible de charger votre lecture en cours");
        }
      } finally {
        if (isMounted.current) {
          setIsLoadingCurrentBook(false);
          fetchingCurrentReading.current = false;
        }
      }
    };

    if (user?.id && isMounted.current) {
      // Only fetch if we don't have memoized data
      if (!memoizedCurrentReading) {
        fetchCurrentReading();
      } else {
        // We already have data, so we're not loading
        setIsLoadingCurrentBook(false);
      }
    } else {
      setIsLoadingCurrentBook(false);
    }
  }, [user?.id, getBooksByStatus, memoizedCurrentReading, inProgress]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Add debugging for loading state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CURRENT READING DIAGNOSTIQUE] Loading state changed:', {
        isLoadingCurrentBook,
        currentReadingId: currentReading?.id || 'none'
      });
    }
  }, [isLoadingCurrentBook, currentReading]);

  return {
    currentReading,
    isLoadingCurrentBook,
  };
};
