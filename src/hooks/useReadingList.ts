import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReadingList } from "@/types/reading";
import { Book } from "@/types/book";
import { getBookById } from "@/mock/books";
import { initializeNewBookReading } from "@/services/reading";
import { toast } from "sonner";

export const useReadingList = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: readingList } = useQuery({
    queryKey: ["reading_list"],
    queryFn: () => {
      const storedList = localStorage.getItem("reading_list");
      return storedList ? JSON.parse(storedList) : [];
    },
  });

  const addToReadingList = async (book: Book) => {
    const storedList = localStorage.getItem("reading_list");
    const currentList: ReadingList[] = storedList ? JSON.parse(storedList) : [];
    
    const exists = currentList.some(
      item => item.user_id === userId && item.book_id === book.id
    );
    
    if (exists) {
      toast.error("Ce livre est déjà dans votre liste");
      return;
    }
    
    try {
      const progress = await initializeNewBookReading(userId, book.id);
      if (!progress) {
        toast.error("Erreur lors de l'initialisation de la lecture");
        return;
      }

      const newEntry: ReadingList = {
        user_id: userId,
        book_id: book.id,
        status: "to_read",
        added_at: new Date().toISOString()
      };
      
      const updatedList = [...currentList, newEntry];
      localStorage.setItem("reading_list", JSON.stringify(updatedList));
      
      queryClient.invalidateQueries({ queryKey: ["reading_list"] });
      
      toast.success(`${book.title} ajouté à votre liste de lecture`);
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      toast.error("Une erreur est survenue lors de l'ajout du livre");
    }
  };

  const getBooksByStatus = (status: ReadingList["status"]) => {
    if (!readingList) return [];
    
    return readingList
      .filter((item: ReadingList) => item.user_id === userId && item.status === status)
      .map((item: ReadingList) => getBookById(item.book_id))
      .filter((book): book is Book => book !== null);
  };

  return {
    addToReadingList,
    getBooksByStatus,
    readingList
  };
};
