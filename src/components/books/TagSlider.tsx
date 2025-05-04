
import React, { useState } from "react";
import { TagPill } from "./TagPill";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface TagSliderProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagSlider: React.FC<TagSliderProps> = ({ tags, selectedTag, onSelectTag }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags ? tags : tags.slice(0, 8);

  const toggleShowAll = () => {
    setShowAllTags(!showAllTags);
  };

  return (
    <div className="space-y-2">
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex gap-2 pb-1">
          <TagPill
            label="Tous"
            selected={selectedTag === null}
            onClick={() => onSelectTag(null)}
          />
          {visibleTags.map((tag) => (
            <TagPill
              key={tag}
              label={tag}
              selected={selectedTag === tag}
              onClick={() => onSelectTag(tag)}
            />
          ))}
        </div>
      </ScrollArea>
      
      {tags.length > 8 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleShowAll}
          className="flex items-center text-coffee-dark hover:text-coffee-darker hover:bg-coffee-light/30"
        >
          {showAllTags ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Voir plus de catégories ({tags.length - 8})
            </>
          )}
        </Button>
      )}
    </div>
  );
};
