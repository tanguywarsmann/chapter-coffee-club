
import { Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface BookCardProps {
  book: Book;
  showAddButton?: boolean;
}

export function BookCard({ book, showAddButton = false }: BookCardProps) {
  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Calculate completion percentage for progress bar
  const progressWidth = (book.chaptersRead / book.totalChapters) * 100;

  const handleAddToReadingList = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to book details
    e.stopPropagation(); // Stop event propagation
    
    // Here we would typically add the book to the user's reading list
    // For now, we'll just show a toast notification
    toast.success(`${book.title} ajouté à votre liste de lecture`);
  };

  return (
    <Link to={`/books/${book.id}`} className="block group">
      <div className="book-card flex flex-col h-full bg-white border border-coffee-light rounded-md overflow-hidden transition-all duration-300 hover:shadow-md relative">
        <div className="book-cover bg-coffee-medium relative aspect-[2/3]">
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
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
              <div className="text-white text-xs mt-1 text-center">
                {Math.round(progressWidth)}% lu
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-medium text-coffee-darker mb-1">{truncateTitle(book.title)}</h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            <span>{book.pages} pages</span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {book.categories.slice(0, 2).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs border-coffee-light">
                {category}
              </Badge>
            ))}
          </div>
          
          {showAddButton && (
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3 w-full border-coffee-medium text-coffee-darker hover:bg-coffee-light/20"
              onClick={handleAddToReadingList}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter à ma liste
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
