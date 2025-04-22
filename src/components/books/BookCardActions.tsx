
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, PlayCircle, RefreshCw, BookPlus, Loader2 } from "lucide-react";
import { Book } from "@/types/book";

interface BookCardActionsProps {
  book: Book;
  isAdding: boolean;
  showAddButton: boolean;
  showDeleteButton: boolean;
  actionLabel?: string;
  onAdd?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onAction?: (e: React.MouseEvent) => void;
}

export const BookCardActions: React.FC<BookCardActionsProps> = ({
  book,
  isAdding,
  showAddButton,
  showDeleteButton,
  actionLabel,
  onAdd,
  onDelete,
  onAction,
}) => (
  <>
    {actionLabel && (
      <Button
        size="sm"
        variant="outline"
        className="mt-3 w-full border-coffee-medium text-coffee-darker hover:bg-coffee-light/20"
        onClick={onAction}
        disabled={isAdding}
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
        onClick={onAdd}
        disabled={isAdding}
      >
        {isAdding ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Ajout en cours...
          </>
        ) : (
          <>
            <BookPlus className="h-4 w-4 mr-1" />
            Ajouter à ma liste
          </>
        )}
      </Button>
    )}
    {showDeleteButton && (
      <Button
        size="sm"
        variant="outline"
        className="mt-2 w-full border-destructive text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Retirer
      </Button>
    )}
  </>
);
