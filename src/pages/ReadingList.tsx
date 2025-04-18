
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookGrid } from "@/components/books/BookGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowDownAZ, Calendar, Book } from "lucide-react";
import { Book as BookType } from "@/types/book";
import { ReadingList } from "@/types/reading";
import { getBookById } from "@/mock/books";
import { toast } from "sonner";

type SortOption = "date" | "author" | "pages";

export default function ReadingList() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [toReadBooks, setToReadBooks] = useState<BookType[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<BookType[]>([]);
  const [completedBooks, setCompletedBooks] = useState<BookType[]>([]);
  
  // User information (in a real app, would come from authentication)
  const userId = localStorage.getItem("user") || "user123";

  useEffect(() => {
    // Check if user is logged in
    if (!userId) {
      navigate("/");
      return;
    }
    
    // Load reading list
    loadReadingList();
  }, [navigate, userId]);
  
  const loadReadingList = () => {
    const storedList = localStorage.getItem("reading_list");
    const readingList: ReadingList[] = storedList ? JSON.parse(storedList) : [];
    
    // Filter user's books by status
    const userBooks = readingList.filter(item => item.user_id === userId);
    
    const toRead = userBooks
      .filter(item => item.status === "to_read")
      .map(item => getBookById(item.book_id))
      .filter((book): book is BookType => book !== null);
      
    const inProgress = userBooks
      .filter(item => item.status === "in_progress")
      .map(item => getBookById(item.book_id))
      .filter((book): book is BookType => book !== null);
      
    const completed = userBooks
      .filter(item => item.status === "completed")
      .map(item => getBookById(item.book_id))
      .filter((book): book is BookType => book !== null);
    
    // Apply sorting
    setToReadBooks(sortBooks(toRead, sortBy));
    setInProgressBooks(sortBooks(inProgress, sortBy));
    setCompletedBooks(sortBooks(completed, sortBy));
  };

  const sortBooks = (books: BookType[], sortOption: SortOption) => {
    return [...books].sort((a, b) => {
      switch(sortOption) {
        case "author":
          return a.author.localeCompare(b.author);
        case "pages":
          return b.pages - a.pages;
        case "date":
        default:
          // Pour l'exemple, on trie par ID car nous n'avons pas de dates réelles
          return b.id.localeCompare(a.id);
      }
    });
  };

  const handleSort = (value: SortOption) => {
    setSortBy(value);
    setToReadBooks(sortBooks(toReadBooks, value));
    setInProgressBooks(sortBooks(inProgressBooks, value));
    setCompletedBooks(sortBooks(completedBooks, value));
  };

  const updateBookStatus = (bookId: string, newStatus: ReadingList["status"]) => {
    const storedList = localStorage.getItem("reading_list");
    const readingList: ReadingList[] = storedList ? JSON.parse(storedList) : [];
    
    const updatedList = readingList.map(item => {
      if (item.user_id === userId && item.book_id === bookId) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    
    localStorage.setItem("reading_list", JSON.stringify(updatedList));
    loadReadingList(); // Reload the lists
    
    const book = getBookById(bookId);
    if (book) {
      toast.success(`${book.title} déplacé vers "${
        newStatus === "to_read" ? "À lire" :
        newStatus === "in_progress" ? "En cours" :
        "Terminés"
      }"`);
    }
  };

  return (
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
  );
}
