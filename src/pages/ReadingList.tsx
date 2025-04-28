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
  
  const isMounted = useRef(true);
  
  const fetchBooks = useCallback(async () => {
    if (!user?.id || !readingList || isFetchingRef.current) return;
    
    if (hasFetchedInitialData() && !isLoadingReadingList && 
        ((toReadBooks.length > 0 || inProgressBooks.length > 0 || completedBooks.length > 0) || 
         (readingList && Array.isArray(readingList) && readingList.length === 0))) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsFetching(true);
    
    try {
      const failedIds = getFailedBookIds ? getFailedBookIds() : [];
      failedIds.forEach(id => unavailableBookIds.add(id));
      
      if (!readingList || !Array.isArray(readingList) || readingList.length === 0) {
        setToReadBooks([]);
        setInProgressBooks([]);
        setCompletedBooks([]);
        setIsLoading(false);
        setIsFetching(false);
        return;
      }
      
      const [toReadResult, inProgressResult, completedResult] = await Promise.all([
        getBooksByStatus("to_read"),
        getBooksByStatus("in_progress"), 
        getBooksByStatus("completed")
      ]);
      
      if (isMounted.current) {
        const stabilizeBooks = (books: Book[]) => {
          return books.map(book => {
            if (book.isUnavailable || unavailableBookIds.has(book.id)) {
              unavailableBookIds.add(book.id);
              return {
                ...book,
                isUnavailable: true,
                isStableUnavailable: true
              };
            }
            return book;
          });
        };
        
        setToReadBooks(sortBooks(stabilizeBooks(toReadResult || []), sortBy));
        setInProgressBooks(sortBooks(stabilizeBooks(inProgressResult || []), sortBy));
        setCompletedBooks(sortBooks(stabilizeBooks(completedResult || []), sortBy));
      }
    } catch (err) {
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
  
  useEffect(() => {
    isMounted.current = true;
    if (user?.id) {
      fetchBooks();
    }
    return () => {
      isMounted.current = false;
    };
  }, [user, fetchBooks]);
  
  useEffect(() => {
    if (!isMounted.current || isLoading) return;
    setToReadBooks(prev => sortBooks([...prev], sortBy));
    setInProgressBooks(prev => sortBooks([...prev], sortBy));
    setCompletedBooks(prev => sortBooks([...prev], sortBy));
  }, [sortBy, sortBooks, isLoading]);

  const renderContent = () => {
    if (isLoading || isLoadingReadingList) {
      return <LoadingBookList />;
    }
    
    if (error) {
      return <BookEmptyState hasError={true} />;
    }
    
    if (toReadBooks.length === 0 && inProgressBooks.length === 0 && completedBooks.length === 0) {
      return (
        <BookEmptyState 
          hasError={false} 
          title="Aucune lecture trouvée" 
          description="Vous n'avez pas encore de livres dans votre liste de lecture."
        />
      );
    }
    
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
