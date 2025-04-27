import React, { useState, useEffect, useRef, useCallback } from "react";
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

// Liste locale pour éviter les re-fetchs de livres indisponibles
const unavailableBookIds = new Set<string>();

export default function ReadingList() {
  const navigate = useNavigate();
  const { 
    getBooksByStatus, 
    isLoadingReadingList, 
    getFailedBookIds, 
    readingList,
    hasFetchedInitialData 
  } = useReadingList();
  const { user } = useAuth();
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  const [toReadBooks, setToReadBooks] = useState([]);
  const [inProgressBooks, setInProgressBooks] = useState([]);
  const [completedBooks, setCompletedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // References to prevent updates on unmounted components and repeated fetching
  const isMounted = useRef(true);
  
  // Log reading list data for diagnostics
  useEffect(() => {
    console.log("[DIAGNOSTIQUE] Données brutes de reading_list:", readingList);
  }, [readingList]);
  
  // Memoized function for fetching books to prevent unnecessary recreations
  const fetchBooks = useCallback(async () => {
    // DEFENSIVE: Don't execute if user is not authenticated
    if (!user || !user.id) {
      return;
    }
    
    // Don't run if component is unmounted or already fetching
    if (!isMounted.current || isFetching) return;
    
    // Check if we already fetched initial data - use the hook's method
    console.log('[DIAGNOSTIQUE] État de hasFetchedInitialData:', hasFetchedInitialData());
    
    // Don't fetch if we've already loaded initial data unless explicitly forced
    if (hasFetchedInitialData() && !isLoadingReadingList) {
      console.log("[DIAGNOSTIQUE] Évitement du re-fetch car les données initiales sont déjà chargées");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsFetching(true);
    
    try {
      // Synchroniser avec la liste globale des livres en échec
      const failedIds = getFailedBookIds ? getFailedBookIds() : [];
      failedIds.forEach(id => unavailableBookIds.add(id));
      
      console.log('[DIAGNOSTIQUE] Récupération des livres pour userId:', user.id);
      
      // Fetch books in parallel for better performance
      const [toReadResult, inProgressResult, completedResult] = await Promise.all([
        getBooksByStatus("to_read"),
        getBooksByStatus("in_progress"), 
        getBooksByStatus("completed")
      ]);
      
      console.log('[DIAGNOSTIQUE] Résultats:', {
        toReadResult: toReadResult?.length || 0,
        inProgressResult: inProgressResult?.length || 0, 
        completedResult: completedResult?.length || 0
      });
      
      // Update only if component is still mounted
      if (isMounted.current) {
        // Marquer explicitement les livres indisponibles pour stabiliser l'interface
        const stabilizeBooks = (books) => {
          return books.map(book => {
            // Si le livre est déjà marqué comme indisponible ou son ID est connu comme problématique
            if (book.isUnavailable || unavailableBookIds.has(book.id)) {
              unavailableBookIds.add(book.id); // Mettre à jour notre cache local
              return {
                ...book,
                isUnavailable: true, // S'assurer que le flag est toujours défini
                isStableUnavailable: true // Drapeau pour éviter les refetch inutiles
              };
            }
            return book;
          });
        };
        
        setToReadBooks(sortBooks(stabilizeBooks(toReadResult || []), sortBy));
        setInProgressBooks(sortBooks(stabilizeBooks(inProgressResult || []), sortBy));
        setCompletedBooks(sortBooks(stabilizeBooks(completedResult || []), sortBy));
        
        // Debug pour voir quels livres sont marqués comme indisponibles
        if (process.env.NODE_ENV === 'development') {
          const totalUnavailable = [...toReadResult, ...inProgressResult, ...completedResult]
            .filter(b => b.isUnavailable).length;
          console.log(`Total unavailable books: ${totalUnavailable}, IDs cached: ${unavailableBookIds.size}`);
        }
      }
    } catch (err) {
      console.error("[DIAGNOSTIQUE] Erreur lors de la récupération des livres:", err);
      if (isMounted.current) {
        setError(err);
        toast.error("Erreur lors du chargement de vos livres");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [user?.id, getBooksByStatus, sortBy, sortBooks, isFetching, getFailedBookIds, hasFetchedInitialData, isLoadingReadingList]);
  
  // Effect for initial loading - triggered only if user is available
  useEffect(() => {
    // Reset mount ref on each mount
    isMounted.current = true;
    
    // Only fetch if user is available
    if (user?.id) {
      console.log('[DIAGNOSTIQUE] Composant monté, démarrage du fetch pour userId:', user.id);
      fetchBooks();
    }
    
    // Cleanup on unmount
    return () => {
      isMounted.current = false;
    };
  }, [user, fetchBooks]);
  
  // Separate effect for sort updates only - doesn't trigger new fetch
  useEffect(() => {
    // Don't update if component is unmounted or books haven't been loaded
    if (!isMounted.current || isLoading) return;
    
    setToReadBooks(prev => sortBooks([...prev], sortBy));
    setInProgressBooks(prev => sortBooks([...prev], sortBy));
    setCompletedBooks(prev => sortBooks([...prev], sortBy));
  }, [sortBy, sortBooks, isLoading]);

  const updateBookStatus = (bookId: string, newStatus: "to_read" | "in_progress" | "completed") => {
    // Ne pas permettre d'actions sur les livres indisponibles
    const bookToUpdate = 
      toReadBooks.find(b => b.id === bookId) || 
      inProgressBooks.find(b => b.id === bookId) || 
      completedBooks.find(b => b.id === bookId);
      
    if (bookToUpdate?.isUnavailable) {
      toast.error("Ce livre n'est pas disponible actuellement");
      return;
    }
    
    // DEFENSIVE: Don't execute if user is not authenticated
    if (!user) {
      toast.error("Vous devez être connecté pour cette action");
      return;
    }
    
    if (!bookToUpdate) {
      console.error("Book not found for ID:", bookId);
      return;
    }
    
    try {
      // Indicate action in progress
      setIsFetching(true);
      
      // Local update without refetch
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
      
      // Clean up loading indicator after update
      if (isMounted.current) {
        setIsFetching(false);
      }
    } catch (err) {
      console.error("Error updating book status:", err);
      if (isMounted.current) {
        setIsFetching(false);
        toast.error("Erreur lors de la mise à jour du statut");
      }
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
                  onAction={(bookId) => {
                    const book = inProgressBooks.find(b => b.id === bookId);
                    if (book?.isUnavailable) {
                      toast.error("Ce livre n'est pas disponible actuellement");
                      return;
                    }
                    navigate(`/books/${bookId}`)
                  }}
                />
              )}
              
              {toReadBooks.length > 0 && (
                <BookListSection
                  title="À lire"
                  description="Votre liste de lecture à venir"
                  books={toReadBooks}
                  actionLabel="Commencer la lecture"
                  onAction={(bookId) => {
                    const book = toReadBooks.find(b => b.id === bookId);
                    if (book?.isUnavailable) {
                      toast.error("Ce livre n'est pas disponible actuellement");
                      return;
                    }
                    updateBookStatus(bookId, "in_progress")
                  }}
                />
              )}
              
              {completedBooks.length > 0 && (
                <BookListSection
                  title="Livres terminés"
                  description="Vos lectures complétées"
                  books={completedBooks}
                  showDate
                  actionLabel="Relire"
                  onAction={(bookId) => {
                    const book = completedBooks.find(b => b.id === bookId);
                    if (book?.isUnavailable) {
                      toast.error("Ce livre n'est pas disponible actuellement");
                      return;
                    }
                    updateBookStatus(bookId, "in_progress")
                  }}
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
