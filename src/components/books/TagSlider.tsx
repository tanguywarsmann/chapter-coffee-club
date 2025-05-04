
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TagPill } from "./TagPill";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TagSliderProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  maxInitialTags?: number;
}

export const TagSlider = ({
  categories,
  selectedCategory,
  onCategorySelect,
  maxInitialTags = 8,
}: TagSliderProps) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleCategories = showAllTags ? categories : categories.slice(0, maxInitialTags);
  
  const hasMoreTags = categories.length > maxInitialTags;

  return (
    <div className="space-y-2">
<ScrollArea className="overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2 py-2 pb-3 px-0.5">
          <TagPill
            key="all"
            label="Tous"
            selected={selectedCategory === null}
            onClick={() => onCategorySelect(null)}
          />
          {visibleCategories.map((category) => (
            <TagPill
              key={category}
              label={category}
              selected={selectedCategory === category}
              onClick={() => onCategorySelect(category)}
            />
          ))}
        </div>
      </ScrollArea>
      
      {hasMoreTags && (
        <button
          onClick={() => setShowAllTags(!showAllTags)}
          className="flex items-center justify-center gap-1 text-xs text-coffee-darker hover:text-coffee-dark w-full"
        >
          {showAllTags ? (
            <>
              <ChevronUp className="h-3 w-3" /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Voir plus ({categories.length - maxInitialTags} catégories)
            </>
          )}
        </button>
      )}
    </div>
  );
};
