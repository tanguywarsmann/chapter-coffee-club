
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
  
  const memoizedCurrentReading = useMemo(() => {
    if (inProgress && inProgress.length > 0) {
      const availableBooks = inProgress.filter(book => !book.isUnavailable);
      if (availableBooks.length > 0) {
        return availableBooks[0];
      } else if (inProgress.length > 0) {
        return {
          ...inProgress[0],
          isStableUnavailable: true
        };
      }
    }
    return null;
  }, [inProgress]);
  
  useEffect(() => {
    if (isMounted.current && memoizedCurrentReading) {
      const currentId = currentReading?.id;
      const newId = memoizedCurrentReading.id;
      
      if (currentId !== newId || !currentReading) {
        setCurrentReading(memoizedCurrentReading);
        setIsLoadingCurrentBook(false);
      }
    }
  }, [memoizedCurrentReading, currentReading]);

  useEffect(() => {
    const fetchCurrentReading = async () => {
      if (!user?.id || fetchingCurrentReading.current) return;
      
      if (inProgress && inProgress.length > 0 && !fetchingCurrentReading.current) {
        return;
      }
      
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
        
        lastFetchedId.current = user.id;
      } catch (error) {
        toast.error("Impossible de charger votre lecture en cours");
      } finally {
        if (isMounted.current) {
          setIsLoadingCurrentBook(false);
          fetchingCurrentReading.current = false;
        }
      }
    };

    if (user?.id && isMounted.current) {
      if (!memoizedCurrentReading) {
        fetchCurrentReading();
      } else {
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

  return {
    currentReading,
    isLoadingCurrentBook,
  };
};
