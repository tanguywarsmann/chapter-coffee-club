
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useReadingList } from "@/hooks/useReadingList";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { BookSortSelect } from "@/components/reading/BookSortSelect";
import { BookListSection } from "@/components/reading/BookListSection";
import { LoadingBookList } from "@/components/reading/LoadingBookList";
import { useBookSorting } from "@/hooks/useBookSorting";
import { BookEmptyState } from "@/components/reading/BookEmptyState";

export default function ReadingList() {
  const navigate = useNavigate();
  const { getBooksByStatus, isLoadingReadingList } = useReadingList();
  const { user } = useAuth();
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  const [toReadBooks, setToReadBooks] = useState([]);
  const [inProgressBooks, setInProgressBooks] = useState([]);
  const [completedBooks, setCompletedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Use separate useEffect for initial load
  useEffect(() => {
    console.log("ReadingList component mounted, user:", user?.id);
    let isMounted = true;
    
    const fetchBooks = async () => {
      if (!user) {
        console.log("No user found, skipping book fetch");
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }
      
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      
      try {
        console.log("Fetching books for ReadingList page...");
        const [toReadResult, inProgressResult, completedResult] = await Promise.all([
          getBooksByStatus("to_read"),
          getBooksByStatus("in_progress"), 
          getBooksByStatus("completed")
        ]);
        
        console.log("Books to read:", toReadResult?.length || 0);
        console.log("Books in progress:", inProgressResult?.length || 0);
        console.log("Completed books:", completedResult?.length || 0);
        
        // Only update state if the component is still mounted
        if (isMounted) {
          setToReadBooks(sortBooks(toReadResult || [], sortBy));
          setInProgressBooks(sortBooks(inProgressResult || [], sortBy));
          setCompletedBooks(sortBooks(completedResult || [], sortBy));
          setDataFetched(true);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
        if (isMounted) {
          setError(err);
          toast.error("Erreur lors du chargement de vos livres");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchBooks();
    
    return () => {
      isMounted = false;
    };
  }, [user, getBooksByStatus]);
  
  // Separate effect for sorting to avoid refetching data
  useEffect(() => {
    if (dataFetched && !isLoading) {
      setToReadBooks(prev => sortBooks([...prev], sortBy));
      setInProgressBooks(prev => sortBooks([...prev], sortBy));
      setCompletedBooks(prev => sortBooks([...prev], sortBy));
    }
  }, [sortBy, dataFetched, sortBooks]);

  const updateBookStatus = (bookId: string, newStatus: "to_read" | "in_progress" | "completed") => {
    const bookToUpdate = 
      toReadBooks.find(b => b.id === bookId) || 
      inProgressBooks.find(b => b.id === bookId) || 
      completedBooks.find(b => b.id === bookId);
    
    if (!bookToUpdate) {
      console.error("Book not found for ID:", bookId);
      return;
    }

    const userId = user?.id;
    
    if (!userId) {
      toast.error("Vous devez être connecté pour cette action");
      return;
    }
    
    try {
      // Set fetching state temporarily
      setIsFetching(true);
      
      // Update local state without refetching from API
      if (newStatus === "to_read") {
        setInProgressBooks(prev => prev.filter(b => b.id !== bookId));
        setCompletedBooks(prev => prev.filter(b => b.id !== bookId));
        setToReadBooks(prev => sortBooks([...prev, bookToUpdate], sortBy));
      } else if (newStatus === "in_progress") {
        setToReadBooks(prev => prev.filter(b => b.id !== bookId));
        setCompletedBooks(prev => prev.filter(b => b.id !== bookId));
        setInProgressBooks(prev => sortBooks([...prev, bookToUpdate], sortBy));
      } else if (newStatus === "completed") {
        setToReadBooks(prev => prev.filter(b => b.id !== bookId));
        setInProgressBooks(prev => prev.filter(b => b.id !== bookId));
        setCompletedBooks(prev => sortBooks([...prev, bookToUpdate], sortBy));
      }
      
      toast.success(`${bookToUpdate.title} déplacé vers "${
        newStatus === "to_read" ? "À lire" :
        newStatus === "in_progress" ? "En cours" :
        "Terminés"
      }"`);
      
      // Clear fetching state after local state update
      setTimeout(() => setIsFetching(false), 500);
      
    } catch (err) {
      console.error("Error updating book status:", err);
      setIsFetching(false);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container py-6 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker">Ma liste de lecture</h1>
            
            <div className="flex items-center gap-4">
              <BookSortSelect value={sortBy} onValueChange={setSortBy} />
              <Button 
                className="bg-coffee-dark hover:bg-coffee-darker" 
                onClick={() => navigate("/explore")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un livre
              </Button>
            </div>
          </div>
          
          {isFetching && (
            <div className="py-2 px-4 bg-coffee-light/20 rounded-md text-center text-sm text-muted-foreground">
              Mise à jour de votre liste de lecture...
            </div>
          )}

          {isLoading || isLoadingReadingList ? (
            <LoadingBookList />
          ) : error ? (
            <BookEmptyState hasError={true} />
          ) : (
            <>
              {inProgressBooks.length > 0 && (
                <BookListSection
                  title="En cours de lecture"
                  description="Reprenez où vous vous êtes arrêté"
                  books={inProgressBooks}
                  showProgress
                  actionLabel="Continuer la lecture"
                  onAction={(bookId) => navigate(`/books/${bookId}`)}
                />
              )}
              
              {toReadBooks.length > 0 && (
                <BookListSection
                  title="À lire"
                  description="Votre liste de lecture à venir"
                  books={toReadBooks}
                  actionLabel="Commencer la lecture"
                  onAction={(bookId) => updateBookStatus(bookId, "in_progress")}
                />
              )}
              
              {completedBooks.length > 0 && (
                <BookListSection
                  title="Livres terminés"
                  description="Vos lectures complétées"
                  books={completedBooks}
                  showDate
                  actionLabel="Relire"
                  onAction={(bookId) => updateBookStatus(bookId, "in_progress")}
                />
              )}
              
              {!isLoading && !error && 
                (inProgressBooks.length === 0 && toReadBooks.length === 0 && completedBooks.length === 0) && (
                <BookEmptyState 
                  hasError={false} 
                  title="Aucune lecture trouvée" 
                  description="Vous n'avez pas encore de livres dans votre liste de lecture."
                />
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
