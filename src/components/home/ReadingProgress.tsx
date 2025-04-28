
import { Book } from "@/types/book";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

interface ReadingProgressProps {
  inProgressBooks: Book[];
  isLoading?: boolean;
}

export function ReadingProgress({ inProgressBooks, isLoading = false }: ReadingProgressProps) {
  // Filtrer les livres pour ignorer les livres cassés ou indisponibles pour l'UI principale
  // Utiliser useMemo pour éviter la recréation du tableau à chaque rendu
  const availableBooks = useMemo(() => {
    return inProgressBooks?.filter(book => !book.isUnavailable) || [];
  }, [inProgressBooks]);
  
  // Si nous sommes en train de charger, afficher un squelette
  if (isLoading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-20 w-16" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-full max-w-[200px] mb-1" />
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-2 w-full mb-1" />
                  <Skeleton className="h-3 w-full max-w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Utiliser les livres disponibles (non indisponibles) pour l'affichage principal
  const books = availableBooks;
  
  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-serif text-coffee-darker">Lectures en cours</CardTitle>
          <CardDescription>Reprenez où vous vous êtes arrêté</CardDescription>
        </div>
        
        {books.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reading-list" className="text-coffee-dark hover:text-coffee-darker">
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {books.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-coffee-light rounded-lg">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium text-coffee-darker mb-1">Aucune lecture en cours</h3>
            <p className="text-muted-foreground mb-4">Commencez votre première lecture</p>
            <Button className="bg-coffee-dark hover:bg-coffee-darker" asChild>
              <Link to="/explore">Explorer les livres</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {books.slice(0, 3).map((book) => {
              // Calculate progress safely with fallbacks for missing data
              const chaptersRead = book.chaptersRead || 0;
              const totalChapters = book.totalChapters || 1;
              const progressPercentage = (chaptersRead / totalChapters) * 100;
              
              return (
                <div key={book.id} className="flex gap-4">
                  <div className="book-cover w-16 h-24 overflow-hidden relative">
                    {book.coverImage ? (
                      <img 
                        src={book.coverImage} 
                        alt={book.title || "Couverture"} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          // Replace broken image with placeholder
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                        <span className="font-serif italic text-white">
                          {(book.title?.substring(0, 1) || "?") }
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/books/${book.id}`} className="block">
                      <h3 className="font-medium line-clamp-1 hover:underline text-coffee-darker">
                        {book.title || "Chargement..."}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {book.author || "..."}
                      </p>
                      
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-coffee-dark"
                            style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(progressPercentage)}% terminé</span>
                          <span>{chaptersRead}/{totalChapters} chapitres</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
