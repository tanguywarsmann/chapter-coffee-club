
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserReadingProgress } from "@/services/reading/progressService";
import { ReadingProgress } from "@/types/reading";
import { Link } from "react-router-dom";
import { BookCover } from "@/components/books/BookCover";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CompletedBooksProps {
  userId: string;
}

export function CompletedBooks({ userId }: CompletedBooksProps) {
  const [completedBooks, setCompletedBooks] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompletedBooks = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const progress = await getUserReadingProgress(userId);
      
      // Filtrer les livres terminés et les trier par date de mise à jour (du plus récent au plus ancien)
      const completed = progress
        .filter(p => {
          // Vérifier à la fois le statut et la progression réelle
          const isStatusCompleted = p.status === "completed";
          const isProgressCompleted = p.chaptersRead >= (p.totalChapters || p.expectedSegments || 1);
          
          console.log(`[DEBUG] Livre ${p.book_title}: status=${p.status}, chaptersRead=${p.chaptersRead}/${p.totalChapters || p.expectedSegments}, completed=${isStatusCompleted || isProgressCompleted}`);
          
          return isStatusCompleted || isProgressCompleted;
        })
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
      console.log(`[DEBUG] Livres terminés trouvés: ${completed.length}`);
      setCompletedBooks(completed);
    } catch (error) {
      console.error("Error fetching completed books:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchCompletedBooks();
  }, [userId]);

  const handleRefresh = () => {
    fetchCompletedBooks(true);
  };

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

  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-serif text-coffee-darker">Livres terminés</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {completedBooks.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
            Aucun livre terminé
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {completedBooks.map((book) => (
              <Link 
                key={book.id} 
                to={`/books/${book.book_id}`}
                className="flex flex-col items-center space-y-2 hover:opacity-80 transition-opacity"
              >
                <BookCover
                  image={book.book_cover}
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
        )}
      </CardContent>
    </Card>
  );
}
