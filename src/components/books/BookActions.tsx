
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, Loader2, Book as BookIcon } from "lucide-react";

interface BookActionsProps {
  isInitializing: boolean;
  onStartReading: () => void;
  pages: number;
  language: string;
}

export const BookActions = ({
  isInitializing,
  onStartReading,
  pages,
  language,
}: BookActionsProps) => (
  <>
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">
        {pages} pages • {language}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20">
          <Bookmark className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <Button 
      className="w-full bg-coffee-dark hover:bg-coffee-darker"
      onClick={onStartReading} 
      disabled={isInitializing}
    >
      {isInitializing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initialisation...
        </>
      ) : (
        <>
          <BookIcon className="h-4 w-4 mr-2" />
          Commencer ma lecture
        </>
      )}
    </Button>
  </>
);
