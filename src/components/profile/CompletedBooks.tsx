
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserReadingProgress } from "@/services/progressService";
import { Link } from "react-router-dom";
import { BookCover } from "@/components/books/BookCover";
import { ReadingProgress } from "@/types/reading";

interface CompletedBooksProps {
  userId: string;
}

export function CompletedBooks({ userId }: CompletedBooksProps) {
  const [completedBooks, setCompletedBooks] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchCompletedBooks() {
      try {
        setLoading(true);
        const progress = await getUserReadingProgress(userId);
        
        // Filtrer les livres terminés et les trier par date de mise à jour (du plus récent au plus ancien)
        const completed = progress
          .filter(p => p.status === "completed")
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        
        setCompletedBooks(completed);
      } catch (error) {
        console.error("Error fetching completed books:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompletedBooks();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Livres terminés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completedBooks.length === 0) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Livres terminés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
            Aucun livre terminé
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Livres terminés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {completedBooks.map((book) => (
            <Link 
              key={book.id} 
              to={`/books/${book.book_id}`}
              className="flex flex-col items-center space-y-2 hover:opacity-80 transition-opacity"
            >
              <BookCover
                coverUrl={book.book_cover}
                title={book.book_title || "Titre inconnu"}
                size="sm"
              />
              <div className="text-sm text-center line-clamp-1 font-medium text-coffee-darker">
                {book.book_title || "Titre inconnu"}
              </div>
              <div className="text-xs text-center line-clamp-1 text-muted-foreground">
                {book.book_author || "Auteur inconnu"}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
