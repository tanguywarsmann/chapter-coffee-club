
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BookSortSelect } from "./BookSortSelect";
import { useNavigate } from "react-router-dom";

interface ReadingListHeaderProps {
  sortBy: string;
  onSortChange: (value: any) => void;
}

export function ReadingListHeader({ sortBy, onSortChange }: ReadingListHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-serif font-medium text-coffee-darker">Ma liste de lecture</h1>
      
      <div className="flex items-center gap-4">
        <BookSortSelect value={sortBy} onValueChange={onSortChange} />
        <Button 
          className="bg-coffee-dark hover:bg-coffee-darker" 
          onClick={() => navigate("/explore")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un livre
        </Button>
      </div>
    </div>
  );
}
