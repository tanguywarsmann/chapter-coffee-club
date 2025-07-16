import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  description?: string | null;
}

interface DiscoverBookGridProps {
  books: Book[];
}

export function DiscoverBookGrid({ books }: DiscoverBookGridProps) {
  if (!books.length) {
    return (
      <div className="text-center p-8 border border-dashed border-border rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium text-foreground mb-2">Aucun livre trouvé</h3>
        <p className="text-muted-foreground">Revenez plus tard pour découvrir de nouveaux livres</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <Link key={book.id} to={`/books/${book.id}`}>
          <Card className="h-full hover:scale-[1.02] transition-transform duration-200 bg-card border-border">
            <CardContent className="p-0">
              <div className="aspect-[3/4] bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                {book.cover_url ? (
                  <img 
                    src={book.cover_url} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-medium text-foreground line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {book.author}
                </p>
                {book.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {book.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}