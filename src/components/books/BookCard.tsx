import React, { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useReadingList } from "@/hooks/useReadingList";
import { BookCover } from "./BookCover";
import { BookCardActions } from "./BookCardActions";
import { supabase } from "@/integrations/supabase/client";

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
  onAction,
}: BookCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { addToReadingList } = useReadingList(userId || "");

  // Get the user ID from Supabase auth session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data?.user?.id) {
        console.log("User authenticated in BookCard:", data.user.id);
        setUserId(data.user.id);
      } else {
        console.warn("No authenticated user found in BookCard");
      }
    };

    getUser();
  }, []);

  // Utility to truncate the book title
  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Handle removal from reading list
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Vous devez être connecté pour cette action");
      return;
    }

    // Remove the book
    const storedList = localStorage.getItem("reading_list");
    const readingList = storedList ? JSON.parse(storedList) : [];
    const updatedList = readingList.filter(
      (item: any) => !(item.user_id === userId && item.book_id === book.id)
    );
    localStorage.setItem("reading_list", JSON.stringify(updatedList));
    toast.success(`${book.title} retiré de votre liste`);
  };

  // Handle adding to reading list
  const handleAddToReadingList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Vous devez être connecté pour ajouter un livre à votre liste");
      return;
    }

    try {
      setIsAdding(true);
      await addToReadingList(book);
    } catch (error) {
      console.error("Error in handleAddToReadingList:", error);
      toast.error(
        "Une erreur est survenue: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsAdding(false);
    }
  };

  // Handle the custom action
  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    onAction?.();
  };

  return (
    <Link to={`/books/${book.id}`} className="block group">
      <div className="book-card flex flex-col h-full bg-white border border-coffee-light rounded-md overflow-hidden transition-all duration-300 hover:shadow-md relative">
        <BookCover book={book} showProgress={showProgress} />
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

          <BookCardActions
            book={book}
            isAdding={isAdding}
            showAddButton={showAddButton}
            showDeleteButton={showDeleteButton}
            actionLabel={actionLabel}
            onAdd={handleAddToReadingList}
            onDelete={handleDelete}
            onAction={handleAction}
          />
        </div>
      </div>
    </Link>
  );
}
