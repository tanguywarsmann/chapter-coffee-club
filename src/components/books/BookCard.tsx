
import { Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Calculate completion percentage for progress bar
  const progressWidth = (book.chaptersRead / book.totalChapters) * 100;

  return (
    <Link to={`/books/${book.id}`} className="block">
      <div className="book-card group flex flex-col h-full">
        <div className="book-cover bg-coffee-medium relative">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
              <span className="text-white font-serif italic text-xl">{book.title.substring(0, 1)}</span>
            </div>
          )}
          
          {book.isCompleted && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-chocolate-dark text-white">Terminé</Badge>
            </div>
          )}
          
          {!book.isCompleted && book.chaptersRead > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <div className="reading-progress">
                <div className="progress-bar" style={{ width: `${progressWidth}%` }}></div>
              </div>
              <div className="text-white text-xs mt-1 text-center">
                {Math.round(progressWidth)}% lu
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-medium text-coffee-darker mb-1">{truncateTitle(book.title)}</h3>
          <p className="text-sm text-muted-foreground mb-auto">{book.author}</p>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {book.categories.slice(0, 2).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs border-coffee-light">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
