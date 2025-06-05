
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BookSortSelect, SortOption } from "./BookSortSelect";
import { useNavigate } from "react-router-dom";

interface ReadingListHeaderProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function ReadingListHeader({ sortBy, onSortChange }: ReadingListHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Titre principal - optimisé pour mobile */}
      <h1 className="text-2xl sm:text-3xl font-serif font-medium text-coffee-darker text-center sm:text-left">
        Ma liste de lecture
      </h1>
      
      {/* Actions - layout responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto">
          <BookSortSelect value={sortBy} onValueChange={onSortChange} />
        </div>
        
        <Button 
          className="w-full sm:w-auto bg-coffee-dark hover:bg-coffee-darker min-h-[44px]" 
          onClick={() => navigate("/explore")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un livre
        </Button>
      </div>
    </div>
  );
}
