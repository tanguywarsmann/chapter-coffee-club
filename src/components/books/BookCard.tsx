
import React, { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useReadingList } from "@/hooks/useReadingList";
import { BookCover } from "./BookCover";
import { BookCardActions } from "./BookCardActions";
import { BookOpen, BookMarked, CheckCircle } from "lucide-react";

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
  const { addToReadingList } = useReadingList();

  // Vérification importante : si livre undefined, retourner null
  if (!book) {
    return null;
  }
  
  // S'assurer qu'on a un identifiant valide pour la navigation
  const bookIdentifier = book.id || book.slug || '';

  // Get the user ID from Supabase auth session
  useEffect(() => {
    const getUser = async () => {
      try {
        if (typeof window === "undefined") return;
        
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase.auth.getUser();
        
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error("Error getting authenticated user:", error);
      }
    };

    getUser();
  }, []);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  };

  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (!title) return "Titre inconnu";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Vous devez être connecté pour cette action");
      return;
    }

    try {
      if (typeof window !== "undefined") {
        const storedList = localStorage.getItem("reading_list");
        const readingList = storedList ? JSON.parse(storedList) : [];
        const updatedList = readingList.filter(
          (item: any) => !(item.user_id === userId && item.book_id === book.id)
        );
        localStorage.setItem("reading_list", JSON.stringify(updatedList));
        toast.success(`${book.title} retiré de votre liste`);
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression du livre de la liste");
      console.error("Error in handleDelete:", error);
    }
  };

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
      console.error("Erreur dans handleAddToReadingList:", error);
      toast.error(
        "Une erreur est survenue: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    onAction?.();
  };
  
  const getBookStatusIcon = () => {
    if (book.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600 absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-0.5" aria-hidden="true" />;
    } else if (book.chaptersRead && book.chaptersRead > 0) {
      return <BookOpen className="h-5 w-5 text-coffee-dark absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-0.5" aria-hidden="true" />;
    } else {
      return <BookMarked className="h-5 w-5 text-coffee-medium absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-0.5" aria-hidden="true" />;
    }
  };

  const getStatusLabel = () => {
    if (book.isCompleted) {
      return "Terminé";
    } else if (book.chaptersRead && book.chaptersRead > 0) {
      return "En cours de lecture";
    } else {
      return "À lire";
    }
  };

  return (
    <Link 
      to={`/books/${bookIdentifier}`} 
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md transition-all duration-200"
      aria-label={`${book.title} par ${book.author}. Statut: ${getStatusLabel()}. Appuyez sur Entrée pour ouvrir.`}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      role="link"
    >
      <article className="book-card flex flex-col h-full bg-white border border-coffee-light rounded-md overflow-hidden transition-all duration-300 hover:shadow-md relative transform hover:scale-[1.02] hover:border-coffee-medium focus-within:ring-2 focus-within:ring-coffee-dark focus-within:ring-offset-2">
        <div className="relative">
          <BookCover book={book} showProgress={showProgress} />
          {getBookStatusIcon()}
          <span className="sr-only">{getStatusLabel()}</span>
        </div>
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-medium text-coffee-darker mb-1 focus:outline-none">
            {truncateTitle(book.title)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {book.author || "Auteur inconnu"}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {(book.categories || []).slice(0, 2).map((category, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-coffee-light"
                aria-label={`Catégorie: ${category}`}
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
      </article>
    </Link>
  );
}
