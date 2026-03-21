import React, { useState } from "react";
import type {
  SerializedMeal,
  SerializedMealIngredient,
} from "../../types/medicalApiTypes";
import { useMedicoMealsModalStore } from "../../stores/useMedicoMealsModalStore";
import MediaViewer from "./MediaViewer";
import MealNoteModal from "./MealNoteModal";
import ServingAdjustModal from "../foods/ServingAdjustModal";

interface MealCardProps {
  meal: SerializedMeal;
  patientUuid: string;
  date: string;
  dayId: number;
  onEditMeal?: (meal: SerializedMeal) => void;
  onSaveMealNote: (mealIntakeId: number, note: string) => Promise<void>;
  onDeleteMealNote: (mealIntakeId: number) => Promise<void>;
  onDeleteMeal: (dayId: number, mealId: number) => Promise<void>;
  onAdjustServing: (
    foodId: number,
    servingSize: number,
    unit: string,
  ) => Promise<void>;
  onReloadDay: () => void;
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  patientUuid,
  date,
  dayId,
  onEditMeal,
  onSaveMealNote,
  onDeleteMealNote,
  onDeleteMeal,
  onAdjustServing,
  onReloadDay,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [servingFood, setServingFood] =
    useState<SerializedMealIngredient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingNote, setDeletingNote] = useState(false);

  const openMeal = useMedicoMealsModalStore((s) => s.openMeal);

  const media = meal.media;
  const customerNote = media?.customer_note;
  const doctorNote = media?.doctor_note;
  const ingredients: SerializedMealIngredient[] = meal.ingredients ?? [];

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${meal.meal_name}"?`)) return;
    setDeleting(true);
    try {
      await onDeleteMeal(dayId, meal.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!confirm("¿Eliminar la nota médica de este plato?")) return;
    setDeletingNote(true);
    try {
      await onDeleteMealNote(meal.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar la nota");
    } finally {
      setDeletingNote(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {meal.meal_name}
          </span>
          {meal.meal_time && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {meal.meal_time}
            </span>
          )}
          {meal.is_favorite && (
            <svg
              className="w-4 h-4 text-yellow-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {ingredients.length} ingrediente
            {ingredients.length !== 1 ? "s" : ""}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-50 dark:border-gray-700/50">
          {/* Media */}
          {media && (
            <div className="pt-3">
              <MediaViewer media={media} onImageError={onReloadDay} />
            </div>
          )}

          {/* Customer note */}
          {customerNote && (
            <div className="flex gap-2.5 items-start bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5">
              <span className="text-base leading-none mt-0.5">💬</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Nota del paciente
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {customerNote}
                </p>
              </div>
            </div>
          )}

          {/* Doctor note */}
          <div className="flex gap-2.5 items-start bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-2.5">
            <span className="text-base leading-none mt-0.5">👨‍⚕️</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">
                Nota médica
              </p>
              {doctorNote ? (
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {doctorNote}
                </p>
              ) : (
                <p className="text-xs text-blue-500/70 dark:text-blue-500/50 italic">
                  Sin nota
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setNoteModalOpen(true)}
              className="flex-shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {doctorNote ? "Editar" : "Agregar"}
            </button>
            {doctorNote && (
              <button
                type="button"
                onClick={handleDeleteNote}
                disabled={deletingNote}
                className="flex-shrink-0 text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50"
              >
                {deletingNote ? "..." : "Eliminar"}
              </button>
            )}
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Ingredientes
              </p>
              <div className="space-y-1">
                {ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors"
                  >
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {ing.food_name}
                    </span>
                    <div className="flex items-center gap-2">
                      {ing.quantity != null && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {ing.quantity} {ing.unit ?? "g"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setServingFood(ing)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-all"
                        title="Ajustar porción"
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
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-gray-700/50">
            <div className="flex items-center gap-1">
              {/* Edit meal metadata button */}
              {onEditMeal && (
                <button
                  type="button"
                  onClick={() => onEditMeal(meal)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
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
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"
                    />
                  </svg>
                  Editar
                </button>
              )}
              {/* Edit ingredients button */}
              <button
                type="button"
                onClick={() => openMeal(meal.id, patientUuid, date)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
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
                Editar ingredientes
              </button>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {deleting ? "Eliminando..." : "Eliminar plato"}
            </button>
          </div>
        </div>
      )}

      {/* Meal Note Modal */}
      <MealNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        mealName={meal.meal_name}
        currentNote={doctorNote}
        onSave={(note) => onSaveMealNote(meal.id, note)}
      />

      {/* Serving Adjust Modal */}
      {servingFood && (
        <ServingAdjustModal
          isOpen={true}
          onClose={() => setServingFood(null)}
          food={{
            food_id: servingFood.food_id,
            food_name: servingFood.food_name,
            current_serving: servingFood.quantity,
            unit: servingFood.unit,
          }}
          onSave={(foodId, size, unit) => onAdjustServing(foodId, size, unit)}
        />
      )}
    </div>
  );
};

export default MealCard;
