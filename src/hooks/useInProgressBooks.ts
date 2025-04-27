
import { useState, useRef, useEffect } from "react";
import { Book } from "@/types/book";
import { getBooksInProgressFromAPI, syncBookWithAPI } from "@/services/reading";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useInProgressBooks = () => {
  const { user } = useAuth();
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);
  const hasFetchedBooks = useRef(false);
  const fetchingInProgress = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    if (user?.id) {
      hasFetchedBooks.current = false;
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const fetchInProgressBooks = async () => {
    if (!user?.id || hasFetchedBooks.current || !isMounted.current || fetchingInProgress.current) {
      return;
    }
    
    try {
      fetchingInProgress.current = true;
      setIsLoading(true);
      setError(null);
      
      const books = await getBooksInProgressFromAPI(user.id);
      
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
    if (user?.id && !hasFetchedBooks.current && !fetchingInProgress.current) {
      fetchInProgressBooks();
    } else if (!user?.id) {
      setIsLoading(false);
    }
  }, [user]);

  const handleProgressUpdate = async (bookId: string) => {
    if (currentBook?.isUnavailable) {
      toast.error("Ce livre n'est pas disponible actuellement");
      return;
    }
    
    if (!user?.id) {
      toast.error("Vous devez être connecté pour mettre à jour votre progression");
      return;
    }
    
    try {
      setIsLoading(true);
      const updatedBook = await syncBookWithAPI(user.id, bookId);
      
      if (!isMounted.current) return;
      
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      if (!fetchingInProgress.current) {
        const books = await getBooksInProgressFromAPI(user.id);
        
        if (!isMounted.current) return;
        
        setInProgressBooks(books);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      if (isMounted.current) {
        toast.error("Erreur lors de la mise à jour de la progression");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    currentBook,
    inProgressBooks,
    isLoading,
    error,
    handleProgressUpdate,
  };
};
