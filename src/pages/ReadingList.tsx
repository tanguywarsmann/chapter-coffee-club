
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReadingList() {
  const navigate = useNavigate();
  const { getBooksByStatus, isLoadingReadingList } = useReadingList();
  const { user } = useAuth();
  const { sortBy, setSortBy, sortBooks } = useBookSorting();
  const [toReadBooks, setToReadBooks] = useState([]);
  const [inProgressBooks, setInProgressBooks] = useState([]);
  const [completedBooks, setCompletedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("ReadingList component mounted, user:", user?.id);
    
    const fetchBooks = async () => {
      if (!user) {
        console.log("No user found, skipping book fetch");
        return;
      }
      
      setIsLoading(true);
      setIsFetching(true);
      setError(null);
      
      try {
        console.log("Fetching books for ReadingList page...");
        const toReadResult = await getBooksByStatus("to_read");
        const inProgressResult = await getBooksByStatus("in_progress"); 
        const completedResult = await getBooksByStatus("completed");
        
        console.log("Books to read:", toReadResult);
        console.log("Books in progress:", inProgressResult);
        console.log("Completed books:", completedResult);
        
        setToReadBooks(sortBooks(toReadResult || [], sortBy));
        setInProgressBooks(sortBooks(inProgressResult || [], sortBy));
        setCompletedBooks(sortBooks(completedResult || [], sortBy));
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err);
        toast.error("Erreur lors du chargement de vos livres");
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };
    
    fetchBooks();
  }, [user, sortBy, getBooksByStatus, isLoadingReadingList, sortBooks]);

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
      const storedList = localStorage.getItem("reading_list");
      const readingList = storedList ? JSON.parse(storedList) : [];
      
      const updatedList = readingList.map((item: any) => {
        if (item.user_id === userId && item.book_id === bookId) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      
      localStorage.setItem("reading_list", JSON.stringify(updatedList));
    } catch (err) {
      console.error("Error updating localStorage:", err);
    }
    
    toast.success(`${bookToUpdate.title} déplacé vers "${
      newStatus === "to_read" ? "À lire" :
      newStatus === "in_progress" ? "En cours" :
      "Terminés"
    }"`);
    
    if (newStatus === "to_read") {
      setInProgressBooks(prev => prev.filter(b => b.id !== bookId));
      setCompletedBooks(prev => prev.filter(b => b.id !== bookId));
      setToReadBooks(prev => [...prev, bookToUpdate]);
    } else if (newStatus === "in_progress") {
      setToReadBooks(prev => prev.filter(b => b.id !== bookId));
      setCompletedBooks(prev => prev.filter(b => b.id !== bookId));
      setInProgressBooks(prev => [...prev, bookToUpdate]);
    } else if (newStatus === "completed") {
      setToReadBooks(prev => prev.filter(b => b.id !== bookId));
      setInProgressBooks(prev => prev.filter(b => b.id !== bookId));
      setCompletedBooks(prev => [...prev, bookToUpdate]);
    }
  };

  // Render empty state if no user or if there's an error
  const renderEmptyState = () => (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Aucune lecture trouvée</CardTitle>
        <CardDescription>
          {error ? "Une erreur est survenue lors du chargement de vos livres." : "Vous n'avez pas encore de livres dans votre liste de lecture."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Button 
          className="bg-coffee-dark hover:bg-coffee-darker" 
          onClick={() => navigate("/explore")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Découvrir des livres
        </Button>
      </CardContent>
    </Card>
  );

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

          {isLoading ? (
            <LoadingBookList />
          ) : error ? (
            renderEmptyState()
          ) : (
            <>
              {inProgressBooks.length > 0 ? (
                <BookListSection
                  title="En cours de lecture"
                  description="Reprenez où vous vous êtes arrêté"
                  books={inProgressBooks}
                  showProgress
                  actionLabel="Continuer la lecture"
                  onAction={(bookId) => navigate(`/books/${bookId}`)}
                />
              ) : null}
              
              {toReadBooks.length > 0 ? (
                <BookListSection
                  title="À lire"
                  description="Votre liste de lecture à venir"
                  books={toReadBooks}
                  actionLabel="Commencer la lecture"
                  onAction={(bookId) => updateBookStatus(bookId, "in_progress")}
                />
              ) : null}
              
              {completedBooks.length > 0 ? (
                <BookListSection
                  title="Livres terminés"
                  description="Vos lectures complétées"
                  books={completedBooks}
                  showDate
                  actionLabel="Relire"
                  onAction={(bookId) => updateBookStatus(bookId, "in_progress")}
                />
              ) : null}
              
              {!isLoading && !error && inProgressBooks.length === 0 && toReadBooks.length === 0 && completedBooks.length === 0 && (
                renderEmptyState()
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
