
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
import { Book } from "@/types/book";

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
  const [toReadBooks, setToReadBooks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // References to prevent updates on unmounted components and repeated fetching
  const isMounted = useRef(true);
  
  // Log reading list data for diagnostics
  useEffect(() => {
    if (readingList && Array.isArray(readingList)) {
      console.log("[DIAGNOSTIQUE] Données brutes de reading_list:", readingList.length, "items");
      console.log("[DIAGNOSTIQUE] Statuts dans reading_list:", 
        readingList.reduce((stats: any, item: any) => {
          stats[item.status] = (stats[item.status] || 0) + 1;
          return stats;
        }, {})
      );
    }
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
    console.log('[DIAGNOSTIQUE] État de isLoadingReadingList:', isLoadingReadingList);
    console.log('[DIAGNOSTIQUE] Données de readingList disponibles:', Array.isArray(readingList) ? readingList.length : 'non');
    
    // Don't fetch if we've already loaded initial data and have some books, unless explicitly forced
    if (hasFetchedInitialData() && !isLoadingReadingList && 
        ((toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0) || 
         (readingList && Array.isArray(readingList) && readingList.length === 0))) {
      console.log("[DIAGNOSTIQUE] Évitement du re-fetch car les données initiales sont déjà chargées");
      setIsLoading(false);
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
      console.log('[DIAGNOSTIQUE] Données de readingList à utiliser:', 
        readingList ? `${(readingList as any[]).length} items` : 'aucune');
      
      // Si nous n'avons pas de données, ne pas tenter de récupérer les livres
      if (!readingList || !Array.isArray(readingList) || readingList.length === 0) {
        console.log("[DIAGNOSTIQUE] Pas de données de lecture disponibles, on met à zéro les listes");
        setToReadBooks([]);
        setInProgressBooks([]);
        setCompletedBooks([]);
        setIsLoading(false);
        setIsFetching(false);
        return;
      }
      
      // Fetch books in parallel for better performance
      console.log("[DIAGNOSTIQUE] Début de la récupération parallèle des livres");
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
        const stabilizeBooks = (books: Book[]) => {
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
          const totalUnavailable = [...(toReadResult || []), ...(inProgressResult || []), ...(completedResult || [])]
            .filter(b => b.isUnavailable).length;
          console.log(`Total unavailable books: ${totalUnavailable}, IDs cached: ${unavailableBookIds.size}`);
        }
      }
    } catch (err) {
      console.error("[DIAGNOSTIQUE] Erreur lors de la récupération des livres:", err);
      if (isMounted.current) {
        setError(err as any);
        toast.error("Erreur lors du chargement de vos livres");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [user?.id, getBooksByStatus, sortBy, sortBooks, isFetching, getFailedBookIds, hasFetchedInitialData, isLoadingReadingList, readingList, toReadBooks.length, inProgressBooks.length, completedBooks.length]);
  
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

  // Display content based on loading state and data availability
  const renderContent = () => {
    // Si les données sont en cours de chargement, afficher l'indicateur de chargement
    if (isLoading || isLoadingReadingList) {
      return <LoadingBookList />;
    }
    
    // Si une erreur s'est produite, afficher l'état d'erreur
    if (error) {
      return <BookEmptyState hasError={true} />;
    }
    
    // Si aucun livre n'est présent dans aucune liste, afficher l'état vide
    if (toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
      // Vérifiez dans les logs les données brutes de reading_list
      console.log("[DIAGNOSTIQUE] Aucun livre à afficher mais readingList contient:", 
        readingList ? `${Array.isArray(readingList) ? (readingList as any[]).length : 0} items` : 'undefined');
      
      return (
        <BookEmptyState 
          hasError={false} 
          title="Aucune lecture trouvée" 
          description="Vous n'avez pas encore de livres dans votre liste de lecture."
        />
      );
    }
    
    // Afficher les sections de livres disponibles
    return (
      <>
        {inProgressBooks.length > 0 && (
          <BookListSection
            title="En cours de lecture"
            description="Reprenez où vous vous êtes arrêté"
            books={inProgressBooks}
            showProgress
            actionLabel="Continuer la lecture"
            onAction={(bookId) => {
              navigate(`/books/${bookId}`);
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
              navigate(`/books/${bookId}`);
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
              navigate(`/books/${bookId}`);
            }}
          />
        )}
      </>
    );
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

          {renderContent()}
        </main>
      </div>
    </AuthGuard>
  );
}
