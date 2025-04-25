
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Book } from "@/types/book";
import { initializeNewBookReading } from "@/services/reading";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";
import { useBookFetching } from "./useBookFetching";
import { bookFailureCache } from "@/utils/bookFailureCache";

export const useReadingList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { fetchBookWithTimeout } = useBookFetching();
  
  const isFetching = useRef(false);
  const errorCount = useRef(0);

  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      errorCount.current = 0;
    }
  }, [user?.id, queryClient]);

  const { data: readingList, isLoading: isLoadingReadingList, error: readingListError } = useQuery({
    queryKey: ["reading_list", user?.id],
    queryFn: async () => {
      if (!user || !user.id) {
        console.warn("Attempted to fetch reading list without a user ID");
        return [];
      }

      try {
        isFetching.current = true;
        
        const { data: readingProgressData, error } = await supabase
          .from("reading_progress")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching reading list from Supabase:", error);
          throw error;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log("Reading progress data from Supabase:", readingProgressData?.length || 0);
        }
        
        isFetching.current = false;
        return readingProgressData || [];
      } catch (error) {
        console.error("Exception while fetching reading list:", error);
        isFetching.current = false;
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 600000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (readingListError) {
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

    try {
      const { data: existingEntries, error: checkError } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", user.id)
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
      
      const progress = await initializeNewBookReading(user.id, book.id);
      if (!progress) {
        toast.error("Erreur lors de l'initialisation de la lecture. Vérifiez votre connexion et réessayez.");
        console.error('Failed to initialize reading progress:', book.id);
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["reading_list", user.id] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      toast.error("Une erreur est survenue lors de l'ajout du livre: " + 
                (error instanceof Error ? error.message : String(error)));
    }
  };

  const getBooksByStatus = async (status: string) => {
    if (!user?.id || !readingList) {
      return [];
    }
    
    if (isFetching.current) {
      console.log("Already fetching books, skipping duplicate request");
      return [];
    }
    
    try {
      isFetching.current = true;
      
      const filteredList = Array.isArray(readingList) 
        ? readingList.filter((item: any) => item.user_id === user.id && item.status === status)
        : [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Filtered list for status ${status}:`, filteredList.length);
      }
      
      if (filteredList.length === 0) {
        isFetching.current = false;
        return [];
      }

      const BATCH_SIZE = 3;
      const books: Book[] = [];
      const batches = [];
      
      for (let i = 0; i < filteredList.length; i += BATCH_SIZE) {
        batches.push(filteredList.slice(i, i + BATCH_SIZE));
      }
      
      for (const batch of batches) {
        const batchPromises = batch.map((item: any) => fetchBookWithTimeout(item.book_id, item));
        
        try {
          const batchResults = await Promise.allSettled(batchPromises);
          
          batchResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              books.push(result.value);
            } else if (process.env.NODE_ENV === 'development') {
              console.warn("Failed to process a book in batch:", result.reason);
            }
          });
          
          if (batches.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (batchError) {
          console.error("Error processing batch of books:", batchError);
        }
      }
      
      isFetching.current = false;
      return books;
    } catch (error) {
      console.error(`Error processing books with status ${status}:`, error);
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
    userId: user?.id,
    getFailedBookIds: () => bookFailureCache.getAll()
  };
};
