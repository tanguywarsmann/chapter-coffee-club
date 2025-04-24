
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookGrid } from "@/components/books/BookGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowDownAZ, Calendar, Book } from "lucide-react";
import { Book as BookType } from "@/types/book";
import { useReadingList } from "@/hooks/useReadingList";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { getBookById } from "@/services/books/bookQueries"; // Import the getBookById function

type SortOption = "date" | "author" | "pages";

export default function ReadingList() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  const { getBooksByStatus, isLoadingReadingList } = useReadingList();
  const { user } = useAuth();
  
  const [toReadBooks, setToReadBooks] = useState<BookType[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<BookType[]>([]);
  const [completedBooks, setCompletedBooks] = useState<BookType[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setIsFetching(true);
      
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
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Erreur lors du chargement de vos livres");
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };
    
    fetchBooks();
  }, [user, sortBy, getBooksByStatus, isLoadingReadingList]);

  const sortBooks = (books: BookType[], sortOption: SortOption) => {
    if (!books || !Array.isArray(books)) {
      console.warn("Attempted to sort non-array books:", books);
      return [];
    }
    
    return [...books].sort((a, b) => {
      switch(sortOption) {
        case "author":
          return (a.author || "").localeCompare(b.author || "");
        case "pages":
          return (b.pages || 0) - (a.pages || 0);
        case "date":
        default:
          return b.id.localeCompare(a.id);
      }
    });
  };

  const handleSort = (value: SortOption) => {
    setSortBy(value);
  };

  const updateBookStatus = (bookId: string, newStatus: "to_read" | "in_progress" | "completed") => {
    // Get the book from one of the existing book arrays instead of calling getBookById
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
    
    // Update reading progress in localStorage for backward compatibility
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
      // Continue execution even if localStorage fails
    }
    
    // Provide feedback to the user
    toast.success(`${bookToUpdate.title} déplacé vers "${
      newStatus === "to_read" ? "À lire" :
      newStatus === "in_progress" ? "En cours" :
      "Terminés"
    }"`);
    
    // Update the state to move the book between categories
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
    
    // Could also trigger a re-fetch of books here if needed
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="container py-6 space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-serif font-medium text-coffee-darker">Ma liste de lecture</h1>
            </div>
            <Card className="border-coffee-light">
              <CardHeader>
                <Skeleton className="h-7 w-52" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container py-6 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker">Ma liste de lecture</h1>
            
            <div className="flex items-center gap-4">
              <Select onValueChange={handleSort as any} value={sortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowDownAZ className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Trier par..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Date
                    </span>
                  </SelectItem>
                  <SelectItem value="author">
                    <span className="flex items-center">
                      <Book className="mr-2 h-4 w-4" />
                      Auteur
                    </span>
                  </SelectItem>
                  <SelectItem value="pages">
                    <span className="flex items-center">
                      <Book className="mr-2 h-4 w-4" />
                      Nombre de pages
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              
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
          
          <Card className="border-coffee-light">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-coffee-darker">En cours de lecture</CardTitle>
              <CardDescription>Reprenez où vous vous êtes arrêté</CardDescription>
            </CardHeader>
            <CardContent>
              <BookGrid 
                books={inProgressBooks}
                showProgress
                actionLabel="Continuer la lecture"
                onAction={(bookId) => navigate(`/books/${bookId}`)}
              />
            </CardContent>
          </Card>
          
          <Card className="border-coffee-light">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-coffee-darker">À lire</CardTitle>
              <CardDescription>Votre liste de lecture à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <BookGrid 
                books={toReadBooks}
                actionLabel="Commencer la lecture"
                onAction={(bookId) => updateBookStatus(bookId, "in_progress")}
              />
            </CardContent>
          </Card>
          
          <Card className="border-coffee-light">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-coffee-darker">Livres terminés</CardTitle>
              <CardDescription>Vos lectures complétées</CardDescription>
            </CardHeader>
            <CardContent>
              <BookGrid 
                books={completedBooks}
                showDate
                actionLabel="Relire"
                onAction={(bookId) => updateBookStatus(bookId, "in_progress")}
                showDeleteButton
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
