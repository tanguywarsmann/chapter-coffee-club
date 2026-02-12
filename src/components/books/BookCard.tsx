
import React, { useState } from "react";
import { Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingList } from "@/hooks/useReadingList";
import { BookCover } from "./BookCover";
import { BookCardActions } from "./BookCardActions";
import { BookOpen, BookMarked, CheckCircle } from "lucide-react";
import { assertValidBook } from "@/utils/bookValidation";
import { 
  getErrorMessage, 
  getErrorToastType, 
  AlreadyInListError,
  AuthenticationRequiredError 
} from "@/utils/readingListErrors";

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
  const { user } = useAuth(); // Utilisation de useAuth au lieu de la logique locale
  const { addToReadingList } = useReadingList();

  // Validation précoce du livre
  if (!book) {
    return null;
  }
  
  // Validation avec notre système centralisé
  try {
    assertValidBook(book as unknown);
  } catch (error) {
    console.error('BookCard: Livre invalide', book, error);
    return null;
  }
  
  const bookIdentifier = book.id || book.slug || '';
  const hasActions = showAddButton || showDeleteButton || Boolean(actionLabel);
  const infoItems = [
    book.pages ? `${book.pages} pages` : null,
    Number.isFinite(book.expectedSegments) ? `${book.expectedSegments} segments` : null,
    book.language ? (book.language.length <= 3 ? book.language.toUpperCase() : book.language) : null
  ].filter(Boolean) as string[];
  const cardMinHeight = hasActions
    ? "min-h-[520px] sm:min-h-[540px]"
    : "min-h-[480px] sm:min-h-[500px]";

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

  const handleAddToReadingList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Vérification d'authentification avec les nouvelles erreurs typées
    if (!user?.id) {
      const error = new AuthenticationRequiredError();
      toast.error(error.message);
      return;
    }

    if (isAdding) {
      return; // Éviter les clics multiples
    }

    try {
      setIsAdding(true);
      console.log(`[DEBUG] Tentative d'ajout du livre:`, { id: book.id, title: book.title });
      
      const success = await addToReadingList(book);
      if (success) {
        console.log(`[DEBUG] Livre ajouté avec succès: ${book.title}`);
      }
    } catch (error) {
      console.error("Erreur dans handleAddToReadingList:", error);
      
      // Gestion d'erreur typée avec toast adapté
      const toastType = getErrorToastType(error);
      const message = getErrorMessage(error);
      
      if (toastType === 'info') {
        toast.info(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsAdding(false); // Protection contre les double-clics assurée
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    onAction?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Fonction de suppression à implémenter");
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

  function getStatusLabel() {
    if (book.isCompleted) {
      return "Terminé";
    }
    if (book.chaptersRead && book.chaptersRead > 0) {
      return "En cours de lecture";
    }
    return "À lire";
  }

  const statusLabel = getStatusLabel();

  return (
    <Link 
      data-testid="book-card"
      to={`/books/${bookIdentifier}`} 
      className="block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-dark focus-visible:ring-offset-2 rounded-md transition-all duration-200"
      aria-label={`${book.title} par ${book.author}. Statut: ${statusLabel}. Appuyez sur Entrée pour ouvrir.`}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      role="link"
    >
      <article className={`book-card flex flex-col h-full ${cardMinHeight} bg-white border border-coffee-light rounded-md overflow-hidden transition-all duration-300 hover:shadow-md relative transform hover:scale-[1.02] hover:border-coffee-medium focus-within:ring-2 focus-within:ring-coffee-dark focus-within:ring-offset-2`}>
        <div className="relative">
          <BookCover book={book} showProgress={showProgress} fluid className="w-full" />
          {getBookStatusIcon()}
          <span className="sr-only">{statusLabel}</span>
        </div>
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-medium text-coffee-darker mb-1 line-clamp-2 min-h-[3.25rem] focus:outline-none">
            {truncateTitle(book.title)}
          </h3>
          <p className="text-body-sm text-muted-foreground line-clamp-1 min-h-[1.25rem]">
            {book.author || "Auteur inconnu"}
          </p>

          <div className="mt-2 flex flex-wrap gap-1 min-h-[36px] overflow-hidden">
            {(book.categories || []).slice(0, 3).map((category, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-caption border-coffee-light"
                aria-label={`Catégorie: ${category}`}
              >
                {category}
              </Badge>
            ))}
          </div>

          {hasActions ? (
            <div className="mt-auto pt-2">
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
          ) : infoItems.length > 0 ? (
            <div className="mt-auto pt-3">
              <div className="flex flex-wrap gap-2 text-caption text-muted-foreground">
                {infoItems.map((item, idx) => (
                  <span
                    key={`${bookIdentifier}-meta-${idx}`}
                    className="px-2 py-1 rounded-full border border-coffee-light/70 bg-coffee-lightest/40"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
