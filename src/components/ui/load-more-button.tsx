import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  showingCount: number;
  totalCount: number;
  className?: string;
}

export const LoadMoreButton = ({
  onLoadMore,
  hasMore,
  isLoading = false,
  showingCount,
  totalCount,
  className = ""
}: LoadMoreButtonProps) => {
  if (!hasMore) return null;

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-[200px] bg-white hover:bg-coffee-light/20 border-coffee-medium text-coffee-dark"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Voir plus de livres
          </>
        )}
      </Button>
      
      <p className="text-body-sm text-muted-foreground">
        {showingCount} sur {totalCount} livres affichés
      </p>
    </div>
  );
};