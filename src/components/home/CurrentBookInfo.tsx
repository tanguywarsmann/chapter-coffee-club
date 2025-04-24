
import { Book } from "@/types/book";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";

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
  const totalPages = book.totalChapters * 30;
  const pagesRead = book.chaptersRead * 30;

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
          <span className="text-coffee-darker">Progression</span>
          <span className="text-muted-foreground">{pagesRead} sur {totalPages} pages</span>
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
            <span className="text-center">Valider 30 pages</span>
            <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
          </>
        )}
      </Button>
    </div>
  );
};
