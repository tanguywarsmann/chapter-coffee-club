
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { BookGrid } from "@/components/books/BookGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getBooksInProgress, getCompletedBooks } from "@/mock/books";

export default function ReadingList() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  const inProgressBooks = getBooksInProgress();
  const completedBooks = getCompletedBooks();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">Ma liste de lecture</h1>
          
          <Button className="bg-coffee-dark hover:bg-coffee-darker" onClick={() => navigate("/explore")}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un livre
          </Button>
        </div>
        
        <Card className="border-coffee-light">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-coffee-darker">En cours de lecture</CardTitle>
            <CardDescription>Reprenez où vous vous êtes arrêté</CardDescription>
          </CardHeader>
          <CardContent>
            <BookGrid books={inProgressBooks} />
          </CardContent>
        </Card>
        
        <Card className="border-coffee-light">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-coffee-darker">Livres terminés</CardTitle>
            <CardDescription>Vos lectures complétées</CardDescription>
          </CardHeader>
          <CardContent>
            <BookGrid books={completedBooks} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
