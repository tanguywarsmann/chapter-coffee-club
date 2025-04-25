
import { useState, useRef, useEffect } from "react";
import { Book } from "@/types/book";
import { getBooksInProgressFromAPI } from "@/services/reading";
import { toast } from "sonner";

export const useInProgressBooks = (userId: string | undefined) => {
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  
  const isMounted = useRef(true);
  const hasFetchedBooks = useRef(false);
  const fetchingInProgress = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    if (userId) {
      hasFetchedBooks.current = false;
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [userId]);

  const fetchInProgressBooks = async () => {
    if (!userId || hasFetchedBooks.current || !isMounted.current || fetchingInProgress.current) {
      return;
    }
    
    try {
      fetchingInProgress.current = true;
      setIsLoading(true);
      setError(null);
      
      const books = await getBooksInProgressFromAPI(userId);
      
      if (!isMounted.current) return;
      
      const stableBooks = books.map(book => {
        if (book.isUnavailable) {
          return {
            ...book,
            isStableUnavailable: true
          };
        }
        return book;
      });
      
      setInProgressBooks(stableBooks);
      
      if (stableBooks && stableBooks.length > 0) {
        const availableBook = stableBooks.find(b => !b.isUnavailable);
        setCurrentBook(availableBook || stableBooks[0]);
      }
      
      hasFetchedBooks.current = true;
    } catch (error) {
      console.error("Error fetching in-progress books:", error);
      if (isMounted.current) {
        setError("Erreur lors du chargement des livres en cours");
        toast.error("Erreur lors du chargement de vos lectures en cours");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        fetchingInProgress.current = false;
      }
    }
  };

  useEffect(() => {
    if (userId && !hasFetchedBooks.current && !fetchingInProgress.current) {
      fetchInProgressBooks();
    } else if (!userId) {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    inProgressBooks,
    isLoading,
    error,
    currentBook,
    setCurrentBook,
    setInProgressBooks,
    fetchInProgressBooks
  };
};
