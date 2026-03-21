import React, { useEffect, useMemo } from "react";
import { usePatientMealsStore } from "../../../../../stores/usePatientMealsStore";
import type { CustomerDayHistory } from "../../../../../stores/usePatientMealsStore";
import type { IngredientInput } from "../types";
import { ModalSheet } from "../../../../../components/ui/ModalSheet";

const EMPTY_DAYS: CustomerDayHistory[] = [];

interface MealTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUuid: string;
  onLoadTemplate: (ingredients: IngredientInput[]) => void;
}

export const MealTemplatesModal: React.FC<MealTemplatesModalProps> = ({
  isOpen,
  onClose,
  patientUuid,
  onLoadTemplate,
}) => {
  const loadMeals = usePatientMealsStore((s) => s.loadMeals);
  // Select raw days (stable reference) — calling computed functions in selectors
  // creates new arrays every render, causing an infinite Zustand re-render loop.
  const rawDays = usePatientMealsStore(
    (s) => s.daysByPatient[patientUuid] ?? EMPTY_DAYS,
  );
  const loading = usePatientMealsStore((s) =>
    s.loadingPatients.has(patientUuid),
  );

  const meals = useMemo(() => rawDays.flatMap((d) => d.meals ?? []), [rawDays]);

  useEffect(() => {
    if (isOpen && patientUuid) {
      loadMeals(patientUuid).catch(() => {});
    }
  }, [isOpen, patientUuid, loadMeals]);

  if (!isOpen) return null;

  const handleSelect = (meal: (typeof meals)[number]) => {
    const ingredients: IngredientInput[] = (meal.ingredients ?? []).map(
      (ing) => ({
        food_id: ing.food_id,
        food_name: ing.food_name,
        quantity: ing.quantity ?? 100,
        unit: ing.unit ?? "g",
        _isNew: true,
      }),
    );
    onLoadTemplate(ingredients);
  };

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      zClass="z-[60]"
      maxHeightClass="max-h-[80vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Platos anteriores
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Cargar ingredientes de un plato previo del paciente
          </p>
        </div>
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

      {/* Content */}
      <div className="overflow-y-auto flex-1 px-4 py-3 pb-safe-bottom">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-500" />
          </div>
        )}

        {!loading && meals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No hay platos anteriores disponibles
            </p>
          </div>
        )}

        {!loading && meals.length > 0 && (
          <div className="space-y-2">
            {meals.map((meal, idx) => {
              const ingCount = meal.ingredients?.length ?? 0;
              if (ingCount === 0) return null;
              return (
                <button
                  key={`${meal.id}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(meal)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {meal.meal_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {ingCount} ingrediente{ingCount !== 1 ? "s" : ""}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(meal.ingredients ?? []).slice(0, 4).map((ing) => (
                          <span
                            key={ing.id}
                            className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded"
                          >
                            {ing.food_name}
                          </span>
                        ))}
                        {ingCount > 4 && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            +{ingCount - 4} más
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-green-500 dark:group-hover:text-green-400 flex-shrink-0 mt-0.5 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ModalSheet>
  );
};
