
import { Book } from "@/types/book";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface ReadingProgressProps {
  inProgressBooks: Book[];
}

export function ReadingProgress({ inProgressBooks }: ReadingProgressProps) {
  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-serif text-coffee-darker">Lectures en cours</CardTitle>
          <CardDescription>Reprenez où vous vous êtes arrêté</CardDescription>
        </div>
        
        {inProgressBooks.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reading-list" className="text-coffee-dark hover:text-coffee-darker">
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {inProgressBooks.length === 0 ? (
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
            {inProgressBooks.slice(0, 3).map((book) => {
              const progressPercentage = (book.chaptersRead / book.totalChapters) * 100;
              
              return (
                <div key={book.id} className="flex gap-4">
                  <div className="book-cover w-16">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                        <span className="text-white font-serif italic">{book.title.substring(0, 1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/books/${book.id}`} className="block">
                      <h3 className="font-medium text-coffee-darker line-clamp-1 hover:underline">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      
                      <div className="mt-2 space-y-1">
                        <div className="reading-progress">
                          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(progressPercentage)}% terminé</span>
                          <span>{book.chaptersRead}/{book.totalChapters} chapitres</span>
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
