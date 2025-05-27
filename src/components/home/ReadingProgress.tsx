
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BookMarked, CheckCircle, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { texts } from "@/i18n/texts";

interface ReadingProgressProps {
  progressItems: ReadingProgressType[];
  isLoading?: boolean;
}

export function ReadingProgress({ progressItems, isLoading = false }: ReadingProgressProps) {
  const isMobile = useIsMobile();
  
  // Verify if progressItems is defined and is an array
  const availableProgresses = useMemo(() => {
    if (!progressItems || !Array.isArray(progressItems)) {
      console.warn("⚠️ progressItems is not an array in ReadingProgress");
      return [];
    }
    return progressItems;
  }, [progressItems]);
  
  if (isLoading) {
    // Skeleton optimisé pour mobile
    if (isMobile) {
      return (
        <Card className="border-coffee-light mobile-optimized">
          <CardHeader className="pb-4">
            <Skeleton className="loading-skeleton-title" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-20 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="loading-skeleton-text" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    
    // Skeleton complet pour desktop
    return (
      <Card className="border-coffee-light">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="loading-skeleton-text" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-1/2" />
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
    <Card className="border-coffee-light mobile-optimized">
      <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'pb-4' : ''}`}>
        <div>
          <CardTitle className="mobile-title">{texts.currentReadings}</CardTitle>
          <CardDescription className="text-base sm:text-sm">{texts.continueWhereYouLeftOff}</CardDescription>
        </div>
        
        {progresses.length > 0 && !isMobile && (
          <Button variant="ghost" size="sm" asChild className="hover:bg-coffee-light/20">
            <Link to="/reading-list" className="text-coffee-dark hover:text-coffee-darker">
              {texts.viewAll} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className={isMobile ? "pt-0" : ""}>
        {progresses.length === 0 ? (
          <div className="text-center p-8 sm:p-6 border border-dashed border-coffee-light rounded-lg mobile-optimized">
            <BookOpen className="mx-auto h-12 w-12 sm:h-8 sm:w-8 text-muted-foreground mb-4 sm:mb-2" />
            <h3 className="mobile-subtitle">{texts.noCurrentReading}</h3>
            <p className="text-muted-foreground mb-6 sm:mb-4 text-base sm:text-sm">{texts.startYourNextAdventure}</p>
            <Button className="bg-coffee-dark hover:bg-coffee-darker" asChild>
              <Link to="/explore">{texts.exploreBooks}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-4">
            {/* Affiche moins d'éléments sur mobile */}
            {progresses.slice(0, isMobile ? 2 : 3).map((progress) => {
              // Ensure progress is defined
              if (!progress) {
                console.warn("⚠️ Un élément des progrès est undefined");
                return null;
              }
              
              // Use pre-calculated values directly
              const { chaptersRead, progressPercent, totalSegments } = progress;
              
              // Don't show if totalSegments is missing or equal to 0
              if (!totalSegments) {
                console.warn("⚠️ totalSegments est 0 ou undefined pour progress.id =", progress.id);
                return null;
              }
              
              // Status icon based on reading state
              const getProgressStatusIcon = () => {
                if (progress.status === "completed") {
                  return <CheckCircle className="h-4 w-4 text-green-600 mr-1" />;
                } else if (chaptersRead > 0) {
                  return <BookOpen className="h-4 w-4 text-coffee-dark mr-1" />;
                } else {
                  return <BookMarked className="h-4 w-4 text-coffee-medium mr-1" />;
                }
              };
              
              // Vue mobile simplifiée
              if (isMobile) {
                return (
                  <div key={progress.id} className="mobile-book-card group">
                    <div className="flex gap-4">
                      {progress.book_cover ? (
                        <img 
                          src={progress.book_cover} 
                          alt={progress.book_title || "Couverture de livre"} 
                          className="w-16 h-20 object-cover rounded"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-20 flex items-center justify-center bg-chocolate-medium rounded">
                          <span className="font-serif italic text-white text-lg">
                            {(progress.book_title || "?").substring(0, 1)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`/books/${progress.book_id}`} className="block">
                          <h3 className="font-medium text-coffee-darker group-hover:underline text-base mb-2 line-clamp-2">
                            {progress.book_title || "Titre inconnu"}
                          </h3>
                          
                          <div className="space-y-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-coffee-dark transition-all duration-500 ease-out"
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{progressPercent}% terminé</span>
                              <span>{chaptersRead}/{totalSegments}</span>
                            </div>
                          </div>
                        </Link>
                        
                        {/* Bouton continuer pour les livres en cours */}
                        {chaptersRead > 0 && progress.status !== "completed" && (
                          <Button
                            size="sm"
                            className="mt-3 w-full bg-coffee-dark hover:bg-coffee-darker"
                            asChild
                          >
                            <Link to={`/books/${progress.book_id}`}>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              {texts.continueReading}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Vue desktop complète
              return (
                <div key={progress.id} className="flex gap-4 group transition-all duration-300 hover:scale-[1.01] p-3 rounded-lg hover:bg-coffee-light/10">
                  <div className="book-cover w-16 h-24 overflow-hidden relative">
                    {progress.book_cover ? (
                      <img 
                        src={progress.book_cover} 
                        alt={progress.book_title || "Couverture de livre"} 
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
                    
                    {/* Indicateur de statut */}
                    <div className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-0.5">
                      {progress.status === "completed" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : chaptersRead > 0 ? (
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
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progressPercent}% terminé</span>
                          <span>
                            {`${chaptersRead}/${totalSegments} segments`}
                          </span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Bouton continuer - seulement pour les livres en cours qui ne sont pas terminés */}
                    {chaptersRead > 0 && progress.status !== "completed" && (
                      <Button
                        size="sm"
                        className="mt-2 bg-coffee-dark hover:bg-coffee-darker"
                        asChild
                      >
                        <Link to={`/books/${progress.book_id}`}>
                          <PlayCircle className="h-4 w-4 mr-1" />
                          {texts.continueReading}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Lien "Voir tout" en bas sur mobile */}
            {isMobile && progresses.length > 2 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/reading-list">
                    Voir les {progresses.length} livres
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
