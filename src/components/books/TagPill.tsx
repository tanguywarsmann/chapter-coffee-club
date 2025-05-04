
import React from "react";

interface TagPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export const TagPill: React.FC<TagPillProps> = ({ label, selected, onClick }) => {
  return (
    <button
      className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
        selected
          ? "bg-coffee-dark text-white"
          : "bg-coffee-light text-coffee-darker hover:bg-coffee-light/70"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
