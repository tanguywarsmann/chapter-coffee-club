
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
  const hasFetchedOnMount = useRef(false);

  // Effect to invalidate query when user changes
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
    } else {
      queryClient.resetQueries({ queryKey: ["reading_list"] });
      errorCount.current = 0;
      hasFetchedOnMount.current = false;
    }
  }, [user?.id, queryClient]);

  const { data: readingList, isLoading: isLoadingReadingList, error: readingListError, isSuccess } = useQuery({
    queryKey: ["reading_list", user?.id],
    queryFn: async () => {
      if (!user || !user.id) {
        console.warn("Attempted to fetch reading list without a user ID");
        return [];
      }

      try {
        isFetching.current = true;
        
        console.log("[DIAGNOSTIQUE] Récupération de la liste de lecture pour l'utilisateur:", user.id);
        
        const { data: readingProgressData, error } = await supabase
          .from("reading_progress")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching reading list from Supabase:", error);
          throw error;
        }

        console.log("[DIAGNOSTIQUE] Données récupérées de reading_progress:", readingProgressData);
        
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
    staleTime: 600000, // Consider data stale after 10 minutes
    refetchOnMount: true, // Force refetch when component mounts
    refetchOnReconnect: true, // Force refetch when reconnecting
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary calls
    retry: 1, // Only retry once on failure
  });

  // Effect to set hasFetchedOnMount when query is successful
  useEffect(() => {
    if (isSuccess) {
      hasFetchedOnMount.current = true;
      console.log("[DIAGNOSTIQUE] Flag hasFetchedOnMount set in success effect:", hasFetchedOnMount.current);
    }
  }, [isSuccess]);

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

    console.log("[DIAGNOSTIQUE] Tentative d'ajout du livre à la liste:", book.id, book.title);
    console.log("[DIAGNOSTIQUE] User ID:", user.id);

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
      
      console.log("[DIAGNOSTIQUE] Vérification des entrées existantes:", existingEntries);
      
      if (existingEntries && existingEntries.length > 0) {
        toast.error("Ce livre est déjà dans votre liste");
        return;
      }
      
      toast.info("Initialisation de la lecture en cours...");
      
      const progress = await initializeNewBookReading(user.id, book.id);
      console.log("[DIAGNOSTIQUE] Résultat de l'initialisation:", progress);
      
      if (!progress) {
        toast.error("Erreur lors de l'initialisation de la lecture. Vérifiez votre connexion et réessayez.");
        console.error('Failed to initialize reading progress:', book.id);
        return;
      }
      
      // Force le rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ["reading_list", user.id] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);

      // Vérification supplémentaire après l'ajout
      setTimeout(async () => {
        const { data: verificationData } = await supabase
          .from("reading_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("book_id", book.id);
        
        console.log("[DIAGNOSTIQUE] Vérification après ajout:", verificationData);
      }, 1000);
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
      
      // Filter the reading list by status
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
      
      // Create batches of book IDs to fetch
      for (let i = 0; i < filteredList.length; i += BATCH_SIZE) {
        batches.push(filteredList.slice(i, i + BATCH_SIZE));
      }
      
      // Process each batch
      for (const batch of batches) {
        const batchPromises = batch.map((item: any) => {
          // Immediately create a fallback book object that will be used if fetch fails
          const fallbackBook: Book = {
            id: item.book_id,
            title: "Chargement...",
            author: "...",
            description: "Chargement des détails du livre...",
            totalChapters: Math.ceil(item.total_pages / 30) || 1,
            chaptersRead: Math.floor(item.current_page / 30),
            isCompleted: item.status === "completed",
            language: "fr",
            categories: [],
            pages: item.total_pages || 0,
            publicationYear: new Date().getFullYear(),
            isUnavailable: false // Will be set to true if fetch fails
          };
          
          // Skip known failed books and return the fallback immediately
          if (bookFailureCache.has(item.book_id)) {
            console.log(`Using cached fallback for known failed book ID: ${item.book_id}`);
            fallbackBook.isUnavailable = true;
            fallbackBook.title = "Livre indisponible";
            fallbackBook.author = "Auteur inconnu";
            fallbackBook.description = "Les détails de ce livre ne sont pas disponibles.";
            return Promise.resolve(fallbackBook);
          }
          
          return fetchBookWithTimeout(item.book_id, item)
            .catch(error => {
              console.error(`Error fetching book ${item.book_id}:`, error);
              bookFailureCache.add(item.book_id);
              fallbackBook.isUnavailable = true;
              fallbackBook.title = "Livre indisponible";
              fallbackBook.author = "Auteur inconnu";
              fallbackBook.description = "Les détails de ce livre ne sont pas disponibles.";
              return fallbackBook;
            });
        });
        
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
      
      console.log(`[DIAGNOSTIQUE] Livres récupérés pour le statut ${status}:`, books.length);
      
      // Mark fetch as complete after processing all batches
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
    getFailedBookIds: () => bookFailureCache.getAll(),
    // Expose this flag for components to check if data has been fetched
    hasFetchedInitialData: () => hasFetchedOnMount.current
  };
};
