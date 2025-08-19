
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Book } from "@/types/book";
import Image from "@/components/ui/image";

interface BookCoverProps {
  book?: Book;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  image?: string;
  title?: string;
  priority?: boolean; // Réservé aux images critiques (lecture en cours)
  className?: string;
  fluid?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({ 
  book, 
  showProgress, 
  size = "md",
  image,
  title,
  priority = false, // Par défaut: pas de priorité pour éviter de bloquer le chargement
  className,
  fluid = false
}) => {
  // Use either the passed image or get it from the book
  const coverImage = image || book?.coverImage;
  const bookTitle = title || book?.title || "Unknown";
  
  // Calculate progress only if we have a book with chapters
  const progressPercentage = book ? (book.chaptersRead / book.totalChapters) * 100 : 0;
  const pagesRead = book ? Math.floor((book.pages / book.totalChapters) * book.chaptersRead) : 0;

  // Size classes and responsive sizes based on the size prop
  const sizeClasses = {
    sm: "w-24 h-36",
    md: "w-32 h-48",
    lg: "w-40 h-60"
  };

  const responsiveSizes = {
    sm: "(max-width: 768px) 80px, 96px",
    md: "(max-width: 768px) 120px, 128px", 
    lg: "(max-width: 768px) 140px, 160px"
  };

  return (
    <div
      className={`book-cover bg-coffee-medium relative aspect-[2/3] ${
        fluid ? "w-full" : sizeClasses[size]
      } ${className || ""}`}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={bookTitle}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
          sizes={fluid ? "(max-width: 768px) 50vw, 25vw" : responsiveSizes[size]}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-coffee-medium">
          <span className="text-white font-serif italic text-h4">
            {bookTitle.substring(0, 1)}
          </span>
        </div>
      )}

      {showProgress && book && book.chaptersRead > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-white text-caption mt-1 text-center">
            {pagesRead} / {book.pages} pages
          </p>
        </div>
      )}
    </div>
  );
};
