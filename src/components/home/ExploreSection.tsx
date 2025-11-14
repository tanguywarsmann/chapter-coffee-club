import { memo, useState } from "react";
import { SearchBar } from "@/components/books/SearchBar";
import { ChevronDown, ChevronUp, Search, BookPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface ExploreSectionProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export const ExploreSection = memo(function ExploreSection({
  onSearch,
  isSearching,
}: ExploreSectionProps) {
  const { t } = useTranslation();
  const { isPremium } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleRequestBook = () => {
    navigate(isPremium ? "/request-book" : "/premium");
  };

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
              {t.explore.title}
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
              placeholder={t.common.searchPlaceholder}
            />

            {/* Request Book Link */}
            <div className="flex items-center justify-center pt-2">
              <Button
                variant="ghost"
                onClick={handleRequestBook}
                className="text-coffee-dark hover:text-coffee-darker hover:bg-accent/10 transition-colors"
              >
                <BookPlus className="h-4 w-4 mr-2" />
                {t.explore.requestBook}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
