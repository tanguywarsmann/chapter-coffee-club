
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BookMarked, CheckCircle, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface ReadingProgressProps {
  progressItems: ReadingProgressType[];
  isLoading?: boolean;
}

export function ReadingProgress({ progressItems, isLoading = false }: ReadingProgressProps) {
  const availableProgresses = useMemo(() => {
    return progressItems || [];
  }, [progressItems]);
  
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
  
  const progresses = availableProgresses;
  
  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-serif text-coffee-darker">Lectures en cours</CardTitle>
          <CardDescription>Reprenez où vous vous êtes arrêté</CardDescription>
        </div>
        
        {progresses.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reading-list" className="text-coffee-dark hover:text-coffee-darker">
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {progresses.length === 0 ? (
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
            {progresses.slice(0, 3).map((progress) => {
              // Calculation of chapters read based on progress and total chapters
              const chaptersRead = progress.total_chapters 
                ? Math.floor(progress.current_page / (progress.total_pages / progress.total_chapters))
                : 0;
              
              // Calculate a percentage for the progress bar
              const progressPercentage = progress.total_pages > 0 
                ? Math.min(Math.round((progress.current_page / progress.total_pages) * 100), 100)
                : 0;
              
              // Book status icon based on progress status
              const getProgressStatusIcon = () => {
                if (progress.status === "completed") {
                  return <CheckCircle className="h-4 w-4 text-green-600 mr-1" />;
                } else if (progress.current_page > 0) {
                  return <BookOpen className="h-4 w-4 text-coffee-dark mr-1" />;
                } else {
                  return <BookMarked className="h-4 w-4 text-coffee-medium mr-1" />;
                }
              };
              
              return (
                <div key={progress.id} className="flex gap-4 group transition-transform duration-300 hover:scale-[1.01]">
                  <div className="book-cover w-16 h-24 overflow-hidden relative">
                    {progress.book_cover ? (
                      <img 
                        src={progress.book_cover} 
                        alt={progress.book_title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                        <span className="font-serif italic text-white">
                          {(progress.book_title || "?").substring(0, 1)}
                        </span>
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <div className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-0.5">
                      {progress.status === "completed" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : progress.current_page > 0 ? (
                        <BookOpen className="h-3 w-3 text-coffee-dark" />
                      ) : (
                        <BookMarked className="h-3 w-3 text-coffee-medium" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/books/${progress.book_id}`} className="block">
                      <h3 className="font-medium line-clamp-1 group-hover:underline text-coffee-darker flex items-center">
                        <span className="hidden md:inline-block">{getProgressStatusIcon()}</span>
                        {progress.book_title || "Titre inconnu"}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground">{progress.book_author || "Auteur inconnu"}</p>
                      
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-coffee-dark transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progressPercentage}% terminé</span>
                          <span>
                            {progress.total_chapters 
                              ? `${chaptersRead}/${progress.total_chapters} chapitres` 
                              : "—/— chapitres"
                            }
                          </span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Resume button - only show for books that are in progress but not completed */}
                    {progress.current_page > 0 && progress.status !== "completed" && (
                      <Button
                        size="sm"
                        className="mt-2 bg-coffee-dark hover:bg-coffee-darker"
                        asChild
                      >
                        <Link to={`/books/${progress.book_id}`}>
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Reprendre
                        </Link>
                      </Button>
                    )}
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
