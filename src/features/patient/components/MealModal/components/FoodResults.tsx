import React from "react";
import type { CustomerFood } from "../../../../../types/intakeCrudTypes";

interface FoodResultsProps {
  results: CustomerFood[];
  query: string;
  onSelect: (food: CustomerFood) => void;
}

export const FoodResults: React.FC<FoodResultsProps> = ({
  results,
  query,
  onSelect,
}) => {
  if (query.trim() && results.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No se encontraron alimentos para "{query}"
        </p>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Escribe para buscar alimentos del paciente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {results.map((food) => (
        <button
          key={food.food_id}
          type="button"
          onClick={() => onSelect(food)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
        >
          <span className="text-sm text-gray-800 dark:text-gray-200 truncate flex-1">
            {food.food_name}
          </span>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {food.custom_serving_size != null && (
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded-md">
                {food.custom_serving_size}
                {food.custom_serving_unit ?? "g"}
              </span>
            )}
            <svg
              className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};
