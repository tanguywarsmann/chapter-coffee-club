
import { useState } from "react";
import { Book } from "@/types/book";
import { getPopularBooks, getRecentlyAddedBooks, getRecommendedBooks } from "@/mock/books";
import { toast } from "sonner";

export const useHomeSearch = () => {
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      return;
    }
    
    const allBooks = [
      ...getPopularBooks(),
      ...getRecentlyAddedBooks(),
      ...getRecommendedBooks()
    ];
    
    const filtered = allBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) || 
      book.author.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    if (filtered.length === 0) {
      toast.info("Aucun livre ne correspond à votre recherche");
    }
  };

  return {
    searchResults,
    setSearchResults,
    handleSearch
  };
};
