
import { Book } from "@/types/book";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { calculateReadingProgress } from "@/lib/progress";
import { texts } from "@/i18n/texts";

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
    <div className="flex-1">
      <h3 
        className="font-medium text-coffee-darker hover:underline cursor-pointer" 
        onClick={onNavigate}
      >
        {book.title}
      </h3>
      <p className="text-sm text-muted-foreground">{book.author}</p>
      
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-coffee-darker">{texts.progression}</span>
          <span className="text-muted-foreground">
            {chaptersRead} {texts.chaptersRead} sur {chaptersTotal}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <Button 
        className="mt-4 w-full bg-coffee-dark hover:bg-coffee-darker text-center"
        onClick={onValidate}
        disabled={isValidating}
      >
        {isValidating ? (
          <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Validation...</>
        ) : (
          <>
            <span className="text-center">{texts.validateSegment}</span>
            <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
          </>
        )}
      </Button>
    </div>
  );
};
