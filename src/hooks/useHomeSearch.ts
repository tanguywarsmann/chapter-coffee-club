
import { useState } from "react";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { mapBookFromRecord } from "@/services/books/bookMapper";

export const useHomeSearch = () => {
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Recherche dans la base de données Supabase
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`);
      
      if (error) {
        console.error("Erreur de recherche:", error);
        toast.error("Erreur lors de la recherche de livres");
        return;
      }
      
      const books: Book[] = data ? data.map(mapBookFromRecord) : [];
      
      setSearchResults(books);
      
      if (books.length === 0) {
        toast.info("Aucun livre ne correspond à votre recherche");
      }
    } catch (err) {
      console.error("Exception lors de la recherche:", err);
      toast.error("Une erreur est survenue pendant la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchResults,
    setSearchResults,
    handleSearch,
    isSearching
  };
};
