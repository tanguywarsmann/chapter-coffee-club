
import { Book } from "@/types/book";
import Image from "@/components/ui/image";

interface CurrentBookCoverProps {
  book: Book;
}

export const CurrentBookCover = ({ book }: CurrentBookCoverProps) => {
  const imageSrc = (book as any)?.coverImage || (book as any)?.cover_url || (book as any)?.book_cover;
  
  console.log("🔍 CurrentBookCover debug:", {
    book: book?.title,
    coverImage: book?.coverImage,
    hasCoverImage: !!book?.coverImage,
    imageSrc
  });

  if (!book) {
    return null;
  }

  return (
    <div className="book-cover w-20 h-30 flex-shrink-0">
      {imageSrc ? (
        <Image 
          src={imageSrc as string} 
          alt={book.title} 
          className="w-full h-full object-cover rounded border-chocolate-light"
          priority={true} // Image critique pour la lecture en cours
          sizes="(max-width: 768px) 72px, 80px"
          onError={(e) => {
            console.error("❌ Image failed to load:", imageSrc);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-coffee-medium rounded border border-coffee-light">
          <span className="text-white font-serif italic text-h4">{book.title.substring(0, 1)}</span>
        </div>
      )}
    </div>
  );
};
