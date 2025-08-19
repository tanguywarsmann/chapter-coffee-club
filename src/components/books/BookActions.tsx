
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, Loader2, Book as BookIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
      <span className="text-body-sm text-muted-foreground">
        {pages} pages • {language}
      </span>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20" 
              disabled
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fonctionnalité à venir</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20" 
              disabled
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fonctionnalité à venir</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
    <Button 
      className="w-full bg-coffee-dark text-white hover:bg-coffee-darker"
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
