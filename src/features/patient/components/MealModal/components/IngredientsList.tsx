import React from "react";
import type { IngredientInput } from "../types";

interface IngredientsListProps {
  ingredients: IngredientInput[];
  onEdit: (ingredient: IngredientInput) => void;
  onDelete: (ingredient: IngredientInput) => void;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients,
  onEdit,
  onDelete,
}) => {
  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg
          className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Sin ingredientes — agrega uno abajo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {ingredients.map((ing) => (
        <div
          key={
            ing._isNew
              ? `new-${ing.food_id}-${ing.food_name}`
              : (ing.id ?? `${ing.food_id}`)
          }
          className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 group transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {ing._isNew && (
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500" />
            )}
            <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
              {ing.food_name}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {ing.quantity}
              {ing.unit ?? "g"}
            </span>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit(ing)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Editar cantidad"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDelete(ing)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Eliminar ingrediente"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
