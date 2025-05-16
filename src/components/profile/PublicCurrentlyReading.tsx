
console.log("Import de PublicCurrentlyReading.tsx OK");

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserReadingProgress } from "@/services/reading/progressService";
import { ReadingProgress } from "@/types/reading";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicCurrentlyReadingProps {
  userId: string;
}

export function PublicCurrentlyReading({ userId }: PublicCurrentlyReadingProps) {
  console.log("Rendering PublicCurrentlyReading", { userId: userId || "undefined" });
  
  const [books, setBooks] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Vérification de l'userId
  if (!userId) {
    console.warn("userId manquant dans PublicCurrentlyReading");
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Lectures en cours</CardTitle>
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
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const progress = await getUserReadingProgress(userId);
        if (!progress || !Array.isArray(progress)) {
          console.warn("Progrès de lecture non disponible ou invalide");
          setBooks([]);
          return;
        }
        const inProgress = progress.filter(p => p.status === "in_progress");
        setBooks(inProgress.slice(0, 3)); // Limite à 3 livres pour l'affichage
      } catch (error) {
        console.error("Erreur lors du chargement des lectures en cours:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    try {
      fetchBooks();
    } catch (e) {
      console.error("Erreur dans useEffect [PublicCurrentlyReading]", e);
    }
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
          {books.map((book) => {
            // Vérification du livre
            if (!book) {
              console.warn("Un livre de books est undefined");
              return null;
            }
            
            return (
              <div key={book.id} className="flex flex-col space-y-3">
                <div className="relative border border-coffee-light rounded-md overflow-hidden">
                  <AspectRatio ratio={2/3}>
                    {book.book_cover ? (
                      <img
                        src={book.book_cover}
                        alt={book.book_title || "Couverture du livre"}
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
                  <h3 className="font-medium text-coffee-darker truncate">{book.book_title || "Titre inconnu"}</h3>
                  <p className="text-sm text-muted-foreground">{book.book_author || "Auteur inconnu"}</p>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={book.progressPercent} 
                    className="h-2 bg-coffee-lightest"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {book.progressPercent}% terminé
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
