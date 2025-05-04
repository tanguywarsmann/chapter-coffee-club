import React from "react";

interface TagSliderProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagSlider: React.FC<TagSliderProps> = ({ tags, selectedTag, onSelectTag }) => {
  return (
    <div className="overflow-x-auto whitespace-nowrap py-2 px-2">
      <div className="flex gap-2 w-max">
        <button
          className={`px-3 py-1 rounded-full text-sm border ${
            selectedTag === null ? "bg-coffee text-white" : "bg-white text-coffee"
          }`}
          onClick={() => onSelectTag(null)}
        >
          Tous
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedTag === tag ? "bg-coffee text-white" : "bg-white text-coffee"
            }`}
            onClick={() => onSelectTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

