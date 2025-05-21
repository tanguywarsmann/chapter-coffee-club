
import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { mapBookFromRecord } from "@/services/books/bookMapper";
import { useNavigate } from "react-router-dom";

export const useHomeSearch = () => {
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for cached/saved searches that might trigger auto-redirect
  useEffect(() => {
    const savedSearchKey = 'read_app_last_search';
    // Clear any saved search that might trigger automatic redirection
    if (localStorage.getItem(savedSearchKey)) {
      console.info("[HOME SEARCH] Clearing saved search to prevent auto-redirect");
      localStorage.removeItem(savedSearchKey);
    }
    
    // Clear search results on mount to prevent auto-redirections
    setSearchResults(null);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query?.trim()) {
      setSearchResults(null);
      setError(null);
      return;
    }
    
    console.info("[HOME SEARCH] Performing search:", query);
    setIsSearching(true);
    setIsRedirecting(false);
    setError(null);
    
    try {
      // Recherche dans la base de données Supabase
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`);
      
      if (error) {
        console.error("Erreur de recherche:", error);
        setError("Erreur lors de la recherche");
        toast.error("Erreur de recherche : Impossible d'effectuer votre recherche", {
          duration: 3000
        });
        return;
      }
      
      const books: Book[] = data ? data.map(mapBookFromRecord) : [];
      console.info(`[HOME SEARCH] Found ${books.length} results`);
      
      // Si un seul livre est trouvé, rediriger après une courte animation
      if (books.length === 1) {
        setIsRedirecting(true);
        setSearchResults(books); // Afficher brièvement le résultat
        
        console.info("[HOME SEARCH] Single result found, preparing redirect to:", books[0].id);
        
        // Attendre 300ms pour l'animation avant de rediriger
        setTimeout(() => {
          navigate(`/books/${books[0].id}`);
        }, 300);
      } else {
        setSearchResults(books);
        
        if (books.length === 0) {
          toast.info("Aucun livre ne correspond à votre recherche");
        }
      }
    } catch (err: any) {
      console.error("Exception lors de la recherche:", err);
      setError(err.message || "Une erreur est survenue");
      toast.error("Erreur de recherche : Une erreur est survenue pendant la recherche", {
        duration: 3000
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setError(null);
  };

  return {
    searchResults,
    setSearchResults,
    handleSearch,
    isSearching,
    isRedirecting,
    error,
    clearSearch
  };
};
