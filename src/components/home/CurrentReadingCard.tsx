
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookOpen } from "lucide-react";
import { Book as BookType } from "@/types/book";
import { toast } from "sonner";
import { texts } from "@/i18n/texts";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "@/components/ui/image";

interface CurrentReadingCardProps {
  book: BookType;
  currentPage: number;
  onContinueReading: () => void;
}

export function CurrentReadingCard({ book, currentPage, onContinueReading }: CurrentReadingCardProps) {
  const isMobile = useIsMobile();
  
  console.log("Rendering CurrentReadingCard", { 
    bookId: book?.id || 'book undefined',
    bookTitle: book?.title || 'title undefined', 
    currentPage: currentPage || 0,
    totalChapters: book?.totalChapters || 0,
    expectedSegments: book?.expectedSegments || 0
  });

  const navigate = useNavigate();
  
  // Vérification complète des props
  if (!book) {
    console.warn("Le livre est undefined dans CurrentReadingCard");
    return null;
  }

  // Check if the book slug or current page is undefined or invalid
  const isReadingInvalid = !book.slug || currentPage === undefined || currentPage < 0;

  // Calculate segment based on current page (with validation)
  const segment = !isReadingInvalid ? Math.floor(currentPage / 8000) : 0;

  // Utiliser totalSegments s'il est disponible, sinon expectedSegments ou totalChapters
  const totalSegments = book.totalSegments || book.expectedSegments || book.total_chapters || 0;

  const handleContinueReading = () => {
    if (!isReadingInvalid) {
      toast.info("Reprise de la lecture…");
      navigate(`/livre/${book.slug}/segment/${segment}`);
    }
  };

  return (
    <Card className="border-coffee-light shadow-sm hover:shadow-md transition-shadow mobile-optimized">
      <CardContent className={`flex gap-4 ${isMobile ? 'p-4' : 'p-4'}`}>
        <div className={`book-cover ${isMobile ? 'w-20 h-28' : 'w-20 h-30'} flex-shrink-0`}>
          {book.coverImage ? (
            <Image 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover rounded"
              priority={true} // Image critique pour la lecture en cours
              sizes="(max-width: 768px) 72px, 80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-chocolate-medium rounded">
              <Book className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} text-white`} />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="mb-4">
            <h3 className={`font-medium text-coffee-darker line-clamp-2 ${isMobile ? 'text-lg mb-2' : 'text-base mb-1'}`}>
              {book.title}
            </h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-base mb-2' : 'text-sm mb-1'}`}>
              {book.author}
            </p>
            <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>
              {segment + 1} sur {totalSegments || '?'} segments
            </p>
          </div>

          {!isReadingInvalid ? (
            <Button 
              className={`bg-coffee-dark text-white hover:bg-coffee-darker gap-2 transition-all duration-200 ${
                isMobile ? 'min-h-[48px] text-base w-full' : 'mt-4'
              }`}
              onClick={handleContinueReading}
            >
              <BookOpen className="h-4 w-4" />
              {texts.continueReading}
            </Button>
          ) : (
            <p className={`text-muted-foreground italic ${isMobile ? 'text-base mt-4' : 'text-sm mt-4'}`}>
              {texts.noCurrentReading}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
