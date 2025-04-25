import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReadingList } from "@/types/reading";
import { Book } from "@/types/book";
import { getBookById } from "@/services/books/bookQueries";
import { initializeNewBookReading } from "@/services/reading";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export const useReadingList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Use a ref to track if we're currently fetching
  const isFetching = useRef(false);
  
  // Track error count to avoid overwhelming the user with error toasts
  const errorCount = useRef(0);

  // Invalidate queries when user changes (login/logout)
  useEffect(() => {
    // Clear reading list queries when user changes
    if (user?.id) {
      // If user logs in, invalidate to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      // If user logs out, reset cache
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      // Reset error count on user change
      errorCount.current = 0;
    }
  }, [user?.id, queryClient]);

  const { data: readingList, isLoading: isLoadingReadingList, error: readingListError } = useQuery({
    queryKey: ["reading_list", user?.id],
    queryFn: async () => {
      // Strict defensive check - stop immediately if no user
      if (!user || !user.id) {
        console.warn("Attempted to fetch reading list without a user ID");
        return [];
      }

      try {
        // Set fetching state
        isFetching.current = true;
        
        // Get reading list directly from Supabase instead of localStorage
        const { data: readingProgressData, error } = await supabase
          .from("reading_progress")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching reading list from Supabase:", error);
          throw error;
        }

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log("Reading progress data from Supabase:", readingProgressData?.length || 0);
        }
        
        isFetching.current = false;
        return readingProgressData || [];
      } catch (error) {
        console.error("Exception while fetching reading list:", error);
        isFetching.current = false;
        throw error; // Re-throw to be caught by React Query's error handling
      }
    },
    enabled: !!user?.id, // Only run query when user ID is available
    staleTime: 600000, // 10 minutes to reduce unnecessary refetches
    refetchOnWindowFocus: false, // Disable refetch on window focus
    retry: 1, // Limit retries
  });

  // Handle errors from the query using the error returned by useQuery
  if (readingListError) {
    // Only show toast for the first error to avoid overwhelming the user
    if (errorCount.current === 0) {
      toast.error("Impossible de récupérer votre liste de lecture");
      errorCount.current++;
    }
    console.error("Reading list query failed:", readingListError);
  }

  const addToReadingList = async (book: Book) => {
    if (!user || !user.id) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      console.error("Missing user ID when adding to reading list");
      return;
    }

    const userId = user.id;
    
    try {
      // Check if book already exists in reading list
      const { data: existingEntries, error: checkError } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("book_id", book.id);
      
      if (checkError) {
        toast.error("Erreur lors de la vérification de votre liste de lecture");
        console.error("Error checking reading list:", checkError);
        return;
      }
      
      if (existingEntries && existingEntries.length > 0) {
        toast.error("Ce livre est déjà dans votre liste");
        return;
      }
      
      toast.info("Initialisation de la lecture en cours...");
      
      const progress = await initializeNewBookReading(userId, book.id);
      if (!progress) {
        toast.error("Erreur lors de l'initialisation de la lecture. Vérifiez votre connexion et réessayez.");
        console.error('Failed to initialize reading progress:', book.id);
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["reading_list", userId] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      toast.error("Une erreur est survenue lors de l'ajout du livre: " + 
                (error instanceof Error ? error.message : String(error)));
    }
  };

  // Debounced fetching to prevent rapid-fire requests
  // and allow books to load in batches for better performance
  const getBooksByStatus = async (status: ReadingList["status"]) => {
    // Strong defensive check - return empty array immediately if no user or readingList
    if (!user?.id || !readingList) {
      return [];
    }
    
    // Don't allow concurrent fetches of the same data
    if (isFetching.current) {
      console.log("Already fetching books, skipping duplicate request");
      return [];
    }
    
    try {
      isFetching.current = true;
      
      // Filter reading list entries by status
      const filteredList = Array.isArray(readingList) 
        ? readingList.filter((item: any) => item.user_id === user.id && item.status === status)
        : [];
      
      // Only log once in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Filtered list for status ${status}:`, filteredList.length);
      }
      
      if (filteredList.length === 0) {
        isFetching.current = false;
        return [];
      }

      // IMPROVEMENT: Process books in batches for better performance
      const BATCH_SIZE = 3; // Process 3 books at a time
      const books: Book[] = [];
      const batches = [];
      
      // Create batches of book IDs for parallel processing
      for (let i = 0; i < filteredList.length; i += BATCH_SIZE) {
        batches.push(filteredList.slice(i, i + BATCH_SIZE));
      }
      
      // Process batches sequentially, but books within each batch in parallel
      for (const batch of batches) {
        // Process each batch in parallel with proper error handling
        const batchPromises = batch.map(async (item: any) => {
          try {
            // FIX: Increased timeout to 10 seconds for more stability
            const bookPromise = getBookById(item.book_id);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout fetching book')), 10000) // Increased from 8s to 10s
            );
            
            // Race between fetch and timeout
            const book = await Promise.race([bookPromise, timeoutPromise]) as Book | null;
            
            if (!book) {
              // Return a fallback book object with the data we do have
              const fallbackBook: Book = {
                id: item.book_id,
                title: "Livre indisponible",
                author: "Auteur inconnu",
                description: "Les détails de ce livre ne sont pas disponibles pour le moment.",
                chaptersRead: Math.floor(item.current_page / 30),
                totalChapters: Math.ceil(item.total_pages / 30) || 1,
                isCompleted: item.status === "completed",
                language: "fr",
                categories: [],
                pages: item.total_pages || 0,
                publicationYear: 0
              };
              
              return fallbackBook;
            }
            
            // Add reading progress information to the book
            return {
              ...book,
              chaptersRead: Math.floor(item.current_page / 30),
              totalChapters: Math.ceil(book.pages / 30) || 1,
              isCompleted: item.status === "completed"
            } as Book;
          } catch (error) {
            // FIX: Improved error handling with better error reporting
            if (error instanceof Error && error.message === 'Timeout fetching book') {
              console.warn(`Timeout fetching book ${item.book_id} - will use fallback`);
            } else {
              console.error(`Error processing book ${item.book_id}:`, error);
            }
            
            // Return a fallback book object on error with special indication of error type
            const errorMessage = error instanceof Error ? 
              error.message.includes('Timeout') ? 
                "Temps d'attente dépassé lors du chargement" : 
                "Erreur lors du chargement" : 
              "Erreur inconnue";
            
            const errorBook: Book = {
              id: item.book_id,
              title: errorMessage,
              author: "Contenu indisponible",
              description: "Impossible de charger les détails de ce livre. Veuillez rafraîchir la page ou réessayer plus tard.",
              chaptersRead: item.current_page ? Math.floor(item.current_page / 30) : 0,
              totalChapters: item.total_pages ? Math.ceil(item.total_pages / 30) : 1,
              isCompleted: item.status === "completed",
              language: "fr",
              categories: [],
              pages: item.total_pages || 0,
              publicationYear: 0
            };
            
            return errorBook;
          }
        });
        
        try {
          // Add successfully fetched books from this batch to the results
          const batchResults = await Promise.allSettled(batchPromises);
          
          // Process the results of the batch, including both successful and failed fetches
          batchResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              books.push(result.value);
            } else if (process.env.NODE_ENV === 'development') {
              // Only log in development to avoid console spam in production
              console.warn("Failed to process a book in batch:", result.reason);
            }
          });
          
          // Small delay between batches to prevent overwhelming the API
          if (batches.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (batchError) {
          // Batch error handling - this should rarely happen
          console.error("Error processing batch of books:", batchError);
          // Continue to next batch instead of failing completely
        }
      }
      
      isFetching.current = false;
      return books;
    } catch (error) {
      console.error(`Error processing books with status ${status}:`, error);
      // Only show one toast error, not per book
      if (errorCount.current < 3) {
        toast.error(`Erreur lors du chargement des livres "${status}"`);
        errorCount.current++;
      }
      isFetching.current = false;
      return [];
    }
  };

  return {
    addToReadingList,
    getBooksByStatus,
    readingList,
    isLoadingReadingList,
    readingListError,
    userId: user?.id // Safe access with optional chaining
  };
};
