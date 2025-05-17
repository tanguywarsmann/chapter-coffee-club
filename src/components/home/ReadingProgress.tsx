
import { ReadingProgress as ReadingProgressType } from "@/types/reading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BookMarked, CheckCircle, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
    // Simpler skeleton for mobile
    if (isMobile) {
      return (
        <Card className="border-coffee-light">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 mb-3">
                <Skeleton className="h-16 w-12" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-full max-w-[150px] mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    
    // Full skeleton for desktop
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
          <CardTitle className="text-xl font-serif text-coffee-darker">Current Readings</CardTitle>
          <CardDescription>Continue where you left off</CardDescription>
        </div>
        
        {progresses.length > 0 && !isMobile && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reading-list" className="text-coffee-dark hover:text-coffee-darker">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {progresses.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-coffee-light rounded-lg">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium text-coffee-darker mb-1">No current readings</h3>
            <p className="text-muted-foreground mb-4">Start your first reading</p>
            <Button className="bg-coffee-dark hover:bg-coffee-darker" asChild>
              <Link to="/explore">Explore books</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show fewer items on mobile */}
            {progresses.slice(0, isMobile ? 2 : 3).map((progress) => {
              // Ensure progress is defined
              if (!progress) {
                console.warn("⚠️ An element of progresses is undefined");
                return null;
              }
              
              // Use pre-calculated values directly
              const { chaptersRead, progressPercent, totalSegments } = progress;
              
              // Don't show if totalSegments is missing or equal to 0
              if (!totalSegments) {
                console.warn("⚠️ totalSegments is 0 or undefined for progress.id =", progress.id);
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
              
              // Simplified mobile view
              if (isMobile) {
                return (
                  <div key={progress.id} className="flex gap-3 group border-b pb-3 last:border-0">
                    {progress.book_cover ? (
                      <img 
                        src={progress.book_cover} 
                        alt={progress.book_title || "Book cover"} 
                        className="w-12 h-16 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-16 flex items-center justify-center bg-chocolate-medium">
                        <span className="font-serif italic text-white">
                          {(progress.book_title || "?").substring(0, 1)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <Link to={`/books/${progress.book_id}`} className="block">
                        <h3 className="font-medium line-clamp-1 group-hover:underline text-coffee-darker">
                          {progress.book_title || "Unknown title"}
                        </h3>
                        
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-coffee-dark"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              }
              
              // Full desktop view
              return (
                <div key={progress.id} className="flex gap-4 group transition-transform duration-300 hover:scale-[1.01]">
                  <div className="book-cover w-16 h-24 overflow-hidden relative">
                    {progress.book_cover ? (
                      <img 
                        src={progress.book_cover} 
                        alt={progress.book_title || "Book cover"} 
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
                        {progress.book_title || "Unknown title"}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground">{progress.book_author || "Unknown author"}</p>
                      
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-coffee-dark transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progressPercent}% complete</span>
                          <span>
                            {`${chaptersRead}/${totalSegments} segments`}
                          </span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Continue button - only for books in progress that aren't completed */}
                    {chaptersRead > 0 && progress.status !== "completed" && (
                      <Button
                        size="sm"
                        className="mt-2 bg-coffee-dark hover:bg-coffee-darker"
                        asChild
                      >
                        <Link to={`/books/${progress.book_id}`}>
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Continue
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Show "View all" link at the bottom on mobile */}
            {isMobile && progresses.length > 2 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/reading-list">
                    View all {progresses.length} books
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
