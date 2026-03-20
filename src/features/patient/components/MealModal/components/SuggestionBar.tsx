import React from "react";

interface Suggestion {
  food_id: number;
  food_name: string;
}

interface SuggestionBarProps {
  suggestions: Suggestion[];
  onSelect: (food: Suggestion) => void;
}

export const SuggestionBar: React.FC<SuggestionBarProps> = ({
  suggestions,
  onSelect,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
      <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
        Sugerencias rápidas
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {suggestions.map((food) => (
          <button
            key={food.food_id}
            type="button"
            onClick={() => onSelect(food)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/40 dark:hover:text-green-300 transition-colors whitespace-nowrap"
          >
            + {food.food_name}
          </button>
        ))}
      </div>
    </div>
  );
};
