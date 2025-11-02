import { memo, useState } from "react";
import { SearchBar } from "@/components/books/SearchBar";
import { ChevronDown, ChevronUp, Search, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ExploreSectionProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export const ExploreSection = memo(function ExploreSection({
  onSearch,
  isSearching,
}: ExploreSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-coffee-dark" />
            <h2 className="text-xl md:text-2xl font-serif font-medium text-coffee-darker">
              Explorer
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Expandable Content */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-6 pb-6 space-y-4">
            {/* Search Bar */}
            <SearchBar
              onSearch={onSearch}
              isSearching={isSearching}
              placeholder="Rechercher par titre, auteur..."
            />

            {/* Discover Link */}
            <div className="flex items-center justify-center pt-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/discover")}
                className="text-coffee-dark hover:text-coffee-darker hover:bg-accent/10 transition-colors"
              >
                <Compass className="h-4 w-4 mr-2" />
                Découvrir tous les livres
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
