
import { Book } from "@/types/book";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { calculateReadingProgress } from "@/lib/progress";
import { texts } from "@/i18n/texts";
import { useIsMobile } from "@/hooks/use-mobile";

interface CurrentBookInfoProps {
  book: Book;
  progressPercentage: number;
  isValidating: boolean;
  onValidate: (e: React.MouseEvent) => void;
  onNavigate: () => void;
}

export const CurrentBookInfo = ({
  book,
  progressPercentage,
  isValidating,
  onValidate,
  onNavigate
}: CurrentBookInfoProps) => {
  const isMobile = useIsMobile();

  console.log("Rendering CurrentBookInfo", {
    bookId: book?.id || "undefined",
    bookTitle: book?.title || "undefined",
    progressPercentage
  });

  // Vérification de la présence du livre
  if (!book) {
    console.warn("Le livre est undefined dans CurrentBookInfo");
    return null;
  }

  const chaptersRead = book.chaptersRead || 0;
  const chaptersTotal = book.totalChapters || book.expectedSegments || 1;

  console.log("📘 CurrentBookInfo debug:", {
    title: book.title,
    chaptersRead,
    chaptersTotal
  });

  return (
    <div className="flex-1 min-w-0">
      <h3 
        className={`font-medium text-coffee-darker hover:underline cursor-pointer transition-colors duration-200 ${
          isMobile ? 'text-h4 mb-2 line-clamp-2' : 'text-body mb-1'
        }`}
        onClick={onNavigate}
      >
        {book.title}
      </h3>
      <p className={`text-muted-foreground ${isMobile ? 'text-body mb-4' : 'text-body-sm mb-3'}`}>
        {book.author}
      </p>
      
      <div className={`space-y-2 ${isMobile ? 'mb-6' : 'mb-4'}`}>
        <div className="flex justify-between text-body-sm">
          <span className="text-coffee-darker font-medium">{texts.progression}</span>
          <span className="text-muted-foreground">
            {chaptersRead} {texts.chaptersRead} sur {chaptersTotal}
          </span>
        </div>
        <Progress value={progressPercentage} className={`${isMobile ? 'h-3' : 'h-2'}`} />
      </div>
      
      <Button 
        className={`w-full bg-coffee-dark hover:bg-coffee-darker text-center transition-all duration-200 ${
          isMobile ? 'min-h-[48px] text-body' : 'min-h-[44px]'
        }`}
        onClick={onValidate}
        disabled={isValidating}
      >
        {isValidating ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Validation...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-center">{texts.validateSegment}</span>
            <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
          </div>
        )}
      </Button>
    </div>
  );
};
