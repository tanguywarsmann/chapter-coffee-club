
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookGrid } from "@/components/books/BookGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowDownAZ, Calendar, Book } from "lucide-react";
import { getBooksInProgress, getCompletedBooks } from "@/mock/books";
import { Book as BookType } from "@/types/book";

type SortOption = "date" | "author" | "pages";

export default function ReadingList() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  
  // Get books from mock data
  const [inProgressBooks, setInProgressBooks] = useState<BookType[]>(getBooksInProgress());
  const [completedBooks, setCompletedBooks] = useState<BookType[]>(getCompletedBooks());

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  const handleSort = (value: SortOption) => {
    setSortBy(value);
    const sortBooks = (books: BookType[]) => {
      return [...books].sort((a, b) => {
        switch(value) {
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

    setInProgressBooks(sortBooks(inProgressBooks));
    setCompletedBooks(sortBooks(completedBooks));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">Ma liste de lecture</h1>
          
          <div className="flex items-center gap-4">
            <Select onValueChange={handleSort} value={sortBy}>
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
            <CardTitle className="text-xl font-serif text-coffee-darker">Livres terminés</CardTitle>
            <CardDescription>Vos lectures complétées</CardDescription>
          </CardHeader>
          <CardContent>
            <BookGrid 
              books={completedBooks}
              showDate
              actionLabel="Relire"
              onAction={(bookId) => navigate(`/books/${bookId}`)}
              showDeleteButton
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
