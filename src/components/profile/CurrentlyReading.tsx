
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserReadingProgress } from "@/services/reading/progressService";
import { BookWithProgress } from "@/types/reading";
import { Link } from "react-router-dom";
import { BookCover } from "@/components/books/BookCover";
import { Progress } from "@/components/ui/progress";

interface CurrentlyReadingProps {
  userId: string;
}

export function CurrentlyReading({ userId }: CurrentlyReadingProps) {
  const [currentBook, setCurrentBook] = useState<BookWithProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // S'assurer que userId existe
  if (!userId) {
    console.warn("❌ Aucun userId reçu dans <CurrentlyReading />");
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-h3 font-serif text-coffee-darker">Lecture en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
            Identifiant utilisateur manquant
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    async function fetchCurrentlyReading() {
      try {
        setLoading(true);
        
        const progress = await getUserReadingProgress(userId);

        if (!progress || progress.length === 0) {
          setCurrentBook(null);
          return;
        }

        const inProgressBooks = progress.filter(p => p.status === "in_progress");

        if (inProgressBooks.length > 0) {
          const mostRecentBook = inProgressBooks.sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          })[0];

          setCurrentBook(mostRecentBook);
        } else {
          setCurrentBook(null);
        }
      } catch (error) {
        console.error("⚠️ Erreur dans fetchCurrentlyReading :", error);
        setCurrentBook(null);
      } finally {
        setLoading(false);
      }
    }

    try {
      fetchCurrentlyReading();
    } catch (e) {
      console.error("Erreur dans useEffect [CurrentlyReading]", e);
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-h3 font-serif text-coffee-darker">Lecture en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentBook) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-h3 font-serif text-coffee-darker">Lecture en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
            Aucun livre en cours de lecture
          </div>
        </CardContent>
      </Card>
    );
  }

  // Utiliser directement le progressPercent maintenant disponible
  const progress = currentBook.progressPercent;

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-h3 font-serif text-coffee-darker">Lecture en cours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0 w-32 mx-auto md:mx-0">
            <Link to={`/books/${currentBook.book_id || currentBook.slug || ''}`}>
              <BookCover
                image={currentBook.book_cover}
                title={currentBook.book_title || "Titre inconnu"}
                size="md"
              />
            </Link>
          </div>
          <div className="flex-grow space-y-4">
            <h3 className="text-h4 font-medium text-coffee-darker">
              <Link to={`/books/${currentBook.book_id || currentBook.slug || ''}`} className="hover:underline">
                {currentBook.book_title || "Titre inconnu"}
              </Link>
            </h3>
            <p className="text-body-sm text-muted-foreground">{currentBook.book_author || "Auteur inconnu"}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-coffee-dark">Progression</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {currentBook.chaptersRead} validation{currentBook.chaptersRead > 1 ? 's' : ''} sur {currentBook.totalSegments || 0} segment{(currentBook.totalSegments || 0) > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
