
import { Book } from "@/types/book";
import { isInIframe, isPreview } from "@/utils/environment";

console.log("Chargement de CurrentBookCover.tsx", {
  isPreview: isPreview(),
  isInIframe: isInIframe(),
});

interface CurrentBookCoverProps {
  book: Book;
}

export const CurrentBookCover = ({ book }: CurrentBookCoverProps) => {
  console.log("Rendering CurrentBookCover", {
    bookId: book?.id || "undefined",
    bookTitle: book?.title || "undefined"
  });

  // Vérification de la présence du livre
  if (!book) {
    console.warn("Le livre est undefined dans CurrentBookCover");
    return null;
  }

  return (
    <div className="book-cover w-20 h-30 flex-shrink-0">
      {book.coverImage ? (
        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
          <span className="text-white font-serif italic text-xl">{book.title.substring(0, 1)}</span>
        </div>
      )}
    </div>
  );
};
