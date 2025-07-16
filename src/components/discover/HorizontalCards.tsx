import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  total_pages: number;
}

interface ProgressBook {
  id: string;
  current_page: number;
  book: Book;
}

interface HorizontalCardsProps {
  books: ProgressBook[];
}

export function HorizontalCards({ books }: HorizontalCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((item) => {
        const progressPercent = (item.current_page / item.book.total_pages) * 100;
        
        return (
          <Link key={item.id} to={`/books/${item.book.id}`}>
            <Card className="h-full hover:scale-[1.02] transition-transform duration-200 bg-card border-border">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-12 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                    {item.book.cover_url ? (
                      <img 
                        src={item.book.cover_url} 
                        alt={item.book.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate">
                      {item.book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {item.book.author}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Page {item.current_page}</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}