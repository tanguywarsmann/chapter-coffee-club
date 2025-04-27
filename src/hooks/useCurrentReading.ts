
import { useState, useRef, useEffect } from "react";
import { Book } from "@/types/book";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingList } from "@/hooks/useReadingList";
import { toast } from "sonner";

export const useCurrentReading = () => {
  const { user } = useAuth();
  const { getBooksByStatus } = useReadingList();
  const [currentReading, setCurrentReading] = useState<Book | null>(null);
  const [isLoadingCurrentBook, setIsLoadingCurrentBook] = useState(true);
  const isMounted = useRef(true);
  const fetchingCurrentReading = useRef(false);

  useEffect(() => {
    const fetchCurrentReading = async () => {
      if (!user?.id || fetchingCurrentReading.current) return;
      
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
      fetchCurrentReading();
    } else {
      setIsLoadingCurrentBook(false);
    }
  }, [user?.id, getBooksByStatus]);

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
