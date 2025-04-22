
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReadingList } from "@/types/reading";
import { Book } from "@/types/book";
import { getBookById } from "@/mock/books";
import { initializeNewBookReading } from "@/services/reading";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const useReadingList = (userId: string) => {
  const queryClient = useQueryClient();
  const [normalizedUserId, setNormalizedUserId] = useState<string>("");

  useEffect(() => {
    // Attempt to get Supabase User ID first
    const getUserId = async () => {
      // Try to get user from Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        console.log("Using Supabase auth ID in useReadingList:", session.user.id);
        setNormalizedUserId(session.user.id);
        return;
      }

      // Fallback to the provided userId (from props)
      if (userId) {
        // If it's a UUID string already, use it directly
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
          console.log("Using valid UUID directly:", userId);
          setNormalizedUserId(userId);
          return;
        }

        // Try to extract UUID from JSON string (for backward compatibility)
        try {
          if (userId.startsWith('{') && userId.includes('}')) {
            const parsedUser = JSON.parse(userId);
            if (parsedUser.id) {
              console.log("Extracted user ID from JSON:", parsedUser.id);
              setNormalizedUserId(parsedUser.id);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing user ID:', e);
        }
      }

      console.warn("No valid user ID found. Using empty string as fallback.");
      setNormalizedUserId("");
    };

    getUserId();
  }, [userId]);

  const { data: readingList } = useQuery({
    queryKey: ["reading_list"],
    queryFn: () => {
      const storedList = localStorage.getItem("reading_list");
      return storedList ? JSON.parse(storedList) : [];
    },
  });

  const addToReadingList = async (book: Book) => {
    if (!normalizedUserId) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      console.error("Missing user ID when adding to reading list");
      return;
    }

    console.log('Adding book to reading list with userId:', normalizedUserId, 'bookId:', book.id);
    
    const storedList = localStorage.getItem("reading_list");
    const currentList: ReadingList[] = storedList ? JSON.parse(storedList) : [];
    
    const exists = currentList.some(
      item => item.user_id === normalizedUserId && item.book_id === book.id
    );
    
    if (exists) {
      toast.error("Ce livre est déjà dans votre liste");
      return;
    }
    
    try {
      toast.info("Initialisation de la lecture en cours...");
      
      const progress = await initializeNewBookReading(normalizedUserId, book.id);
      if (!progress) {
        toast.error("Erreur lors de l'initialisation de la lecture. Vérifiez votre connexion et réessayez.");
        console.error('Failed to initialize reading progress:', book.id);
        return;
      }

      const newEntry: ReadingList = {
        user_id: normalizedUserId,
        book_id: book.id,
        status: "to_read",
        added_at: new Date().toISOString()
      };
      
      const updatedList = [...currentList, newEntry];
      localStorage.setItem("reading_list", JSON.stringify(updatedList));
      
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);
      console.log('Successfully added book to reading list:', book.title);
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      toast.error("Une erreur est survenue lors de l'ajout du livre: " + 
                 (error instanceof Error ? error.message : String(error)));
    }
  };

  const getBooksByStatus = (status: ReadingList["status"]) => {
    if (!readingList) return [];
    
    return readingList
      .filter((item: ReadingList) => item.user_id === normalizedUserId && item.status === status)
      .map((item: ReadingList) => getBookById(item.book_id))
      .filter((book): book is Book => book !== null);
  };

  return {
    addToReadingList,
    getBooksByStatus,
    readingList
  };
};
