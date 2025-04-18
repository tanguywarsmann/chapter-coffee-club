
import { Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Plus, Trash2, PlayCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BookCardProps {
  book: Book;
  showProgress?: boolean;
  showDate?: boolean;
  showAddButton?: boolean;
  showDeleteButton?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function BookCard({ 
  book, 
  showProgress = false,
  showDate = false,
  showAddButton = false,
  showDeleteButton = false,
  actionLabel,
  onAction 
}: BookCardProps) {
  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const progressPercentage = (book.chaptersRead / book.totalChapters) * 100;
  const pagesRead = Math.floor((book.pages / book.totalChapters) * book.chaptersRead);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${book.title} retiré de votre liste`);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAction?.();
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
              <span className="text-white font-serif italic text-xl">
                {book.title.substring(0, 1)}
              </span>
            </div>
          )}
          
          {showProgress && book.chaptersRead > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-white text-xs mt-1 text-center">
                {pagesRead} / {book.pages} pages
              </p>
            </div>
          )}
        </div>
        
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-medium text-coffee-darker mb-1">
            {truncateTitle(book.title)}
          </h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {book.categories.slice(0, 2).map((category, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-coffee-light"
              >
                {category}
              </Badge>
            ))}
          </div>
          
          {actionLabel && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full border-coffee-medium text-coffee-darker hover:bg-coffee-light/20"
              onClick={handleAction}
            >
              {book.isCompleted ? (
                <RefreshCw className="h-4 w-4 mr-1" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-1" />
              )}
              {actionLabel}
            </Button>
          )}
          
          {showAddButton && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full border-coffee-medium text-coffee-darker hover:bg-coffee-light/20"
              onClick={handleAction}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter à ma liste
            </Button>
          )}
          
          {showDeleteButton && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full border-destructive text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Retirer
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
