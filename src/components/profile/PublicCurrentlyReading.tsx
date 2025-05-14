
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingProgress } from "@/types/reading";
import { getUserReadingProgress } from "@/services/reading/progressService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicCurrentlyReadingProps {
  userId: string;
}

export function PublicCurrentlyReading({ userId }: PublicCurrentlyReadingProps) {
  const [books, setBooks] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const progress = await getUserReadingProgress(userId);
        const inProgress = progress.filter(p => p.status === "in_progress");
        setBooks(inProgress.slice(0, 3)); // Limite à 3 livres pour l'affichage
      } catch (error) {
        console.error("Erreur lors du chargement des lectures en cours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Lectures en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (books.length === 0) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Lectures en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">📚</span>
            </div>
            <p className="text-muted-foreground">Aucune lecture en cours</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Lectures en cours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="flex flex-col space-y-3">
              <div className="relative border border-coffee-light rounded-md overflow-hidden">
                <AspectRatio ratio={2/3}>
                  {book.book_cover ? (
                    <img
                      src={book.book_cover}
                      alt={book.book_title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="bg-coffee-lightest w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-coffee-medium">📖</span>
                    </div>
                  )}
                </AspectRatio>
              </div>
              <div>
                <h3 className="font-medium text-coffee-darker truncate">{book.book_title}</h3>
                <p className="text-sm text-muted-foreground">{book.book_author}</p>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={(book.current_page / book.total_pages) * 100} 
                  className="h-2 bg-coffee-lightest"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.floor((book.current_page / book.total_pages) * 100)}% terminé
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
