import React from "react";
import type { SerializedMeal } from "../../../../../types/medicalApiTypes";
import type { IngredientInput } from "../types";
import { MacroRingsHeader } from "./MacroRingsHeader";
import { IngredientsList } from "./IngredientsList";
import { SuggestionBar } from "./SuggestionBar";
import { SearchFooter } from "./SearchFooter";

interface MacroCurrent {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
}

interface MacroTarget {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  sugars_g: number;
}

interface Suggestion {
  food_id: number;
  food_name: string;
}

interface MealSheetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  meal: SerializedMeal;
  ingredients: IngredientInput[];
  pendingNutrition: MacroCurrent;
  dayBase: MacroCurrent;
  dayTargets: MacroTarget | null;
  suggestions: Suggestion[];
  onSuggestionClick: (food: Suggestion) => void;
  onEditIngredient: (ingredient: IngredientInput) => void;
  onDeleteIngredient: (ingredient: IngredientInput) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onOpenSearch: () => void;
  hasChanges: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onLoadTemplate: () => void;
}

export const MealSheetPanel: React.FC<MealSheetPanelProps> = ({
  isOpen,
  onClose,
  meal,
  ingredients,
  pendingNutrition,
  dayBase,
  dayTargets,
  suggestions,
  onSuggestionClick,
  onEditIngredient,
  onDeleteIngredient,
  searchQuery,
  onSearchQueryChange,
  onOpenSearch,
  hasChanges,
  saving,
  error,
  onSave,
  onLoadTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
              Editando plato
            </p>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {meal.meal_name}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Templates button */}
            <button
              type="button"
              onClick={onLoadTemplate}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Cargar desde plato anterior"
            >
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              Plantillas
            </button>
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cerrar"
            >
              <svg
                className="w-5 h-5"
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

        {/* Macro rings */}
        <MacroRingsHeader
          pendingNutrition={pendingNutrition}
          dayBase={dayBase}
          dayTargets={dayTargets}
        />

        {/* Ingredients list (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          <IngredientsList
            ingredients={ingredients}
            onEdit={onEditIngredient}
            onDelete={onDeleteIngredient}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-xl flex-shrink-0">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Suggestion bar */}
        <SuggestionBar suggestions={suggestions} onSelect={onSuggestionClick} />

        {/* Search input footer */}
        <SearchFooter
          query={searchQuery}
          onQueryChange={onSearchQueryChange}
          onOpenSearch={onOpenSearch}
        />

        {/* Save bar */}
        <div className="px-4 pt-2 pb-safe-bottom flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
              hasChanges
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Guardando...
              </span>
            ) : hasChanges ? (
              "Guardar cambios"
            ) : (
              "Cerrar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
