import React, { useState, useEffect } from "react";
import type { CustomerFood } from "../../../../../types/intakeCrudTypes";
import * as foodsService from "../../../../../services/foodsService";

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: CustomerFood;
  patientUuid: string;
  initialQuantity?: number;
  onSave: (food: CustomerFood, quantity: number, unit: string) => void;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  food,
  patientUuid,
  initialQuantity,
  onSave,
}) => {
  const [weight, setWeight] = useState(
    initialQuantity ?? food.custom_serving_size ?? food.serving_size ?? 100,
  );
  const [isSavingServing, setIsSavingServing] = useState(false);
  const [servingError, setServingError] = useState<string | null>(null);
  const [isHabitual, setIsHabitual] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initial =
        initialQuantity ?? food.custom_serving_size ?? food.serving_size ?? 100;
      setWeight(initial);

      const customSize = food.custom_serving_size;
      const isActuallyHabitual =
        !!customSize && Math.abs(initial - customSize) < 0.1;
      setIsHabitual(isActuallyHabitual);
      setServingError(null);
    }
  }, [isOpen, food, initialQuantity]);

  if (!isOpen) return null;

  const servingSize = food.custom_serving_size ?? food.serving_size ?? 100;
  const portions = servingSize > 0 ? weight / servingSize : 0;

  const factor = weight / 100;
  const nutrition = {
    protein: (food.proteins_g ?? 0) * factor,
    carbs: (food.carbs_g ?? 0) * factor,
    fat: (food.fats_g ?? 0) * factor,
    fiber: (food.fiber_g ?? 0) * factor,
    sugars: (food.sugars_g ?? 0) * factor,
    kcal: (food.kcal ?? 0) * factor,
  };

  const handleWeightChange = (newWeight: number) => {
    const w = Math.max(0, newWeight);
    setWeight(w);
    if (
      food.custom_serving_size &&
      Math.abs(w - food.custom_serving_size) > 0.1
    ) {
      setIsHabitual(false);
    }
  };

  const handlePortionChange = (newPortions: number) => {
    const p = Math.max(0, newPortions);
    handleWeightChange(p * servingSize);
  };

  const handleToggleHabitual = async () => {
    if (isHabitual) {
      setIsHabitual(false);
      return;
    }

    setIsSavingServing(true);
    setServingError(null);
    try {
      await foodsService.adjustServing(
        patientUuid,
        food.food_id,
        weight,
        food.serving_unit ?? "g",
      );
      setIsHabitual(true);
    } catch (err) {
      setServingError(
        err instanceof Error ? err.message : "Error al guardar porción",
      );
    } finally {
      setIsSavingServing(false);
    }
  };

  const weightStep = weight < 10 ? 1 : 10;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full sm:max-w-sm bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 uppercase tracking-wide">
              Ingrediente
            </p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {food.food_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
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

        <div className="px-6 py-2 overflow-y-auto space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Prot",
                value: nutrition.protein,
                unit: "g",
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                label: "Grasa",
                value: nutrition.fat,
                unit: "g",
                color: "text-yellow-600 dark:text-yellow-400",
              },
              {
                label: "Carbs",
                value: nutrition.carbs,
                unit: "g",
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "Fibra",
                value: nutrition.fiber,
                unit: "g",
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Azúcar",
                value: nutrition.sugars,
                unit: "g",
                color: "text-red-600 dark:text-red-400",
              },
              {
                label: "Kcal",
                value: nutrition.kcal,
                unit: "",
                color: "text-gray-900 dark:text-white font-bold",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 text-center"
              >
                <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                  {item.label}
                </p>
                <p className={`text-sm ${item.color}`}>
                  {item.value.toFixed(1)}
                  {item.unit}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                Peso ({food.serving_unit || "g"})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleWeightChange(weight - weightStep)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white active:scale-95"
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
                      strokeWidth={2.5}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <div className="flex-1 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(weight)}
                  </span>
                  <span className="ml-1 text-sm text-gray-400">
                    {food.serving_unit || "g"}
                  </span>
                </div>
                <button
                  onClick={() => handleWeightChange(weight + weightStep)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white active:scale-95"
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
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                Porciones ({servingSize}
                {food.serving_unit || "g"})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePortionChange(portions - 0.5)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white active:scale-95"
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
                      strokeWidth={2.5}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <div className="flex-1 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {portions % 1 === 0 ? portions : portions.toFixed(1)}
                  </span>
                  <span className="ml-1 text-sm text-gray-400">porc.</span>
                </div>
                <button
                  onClick={() => handlePortionChange(portions + 0.5)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white active:scale-95"
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
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleToggleHabitual}
              disabled={isSavingServing}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isHabitual
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isHabitual
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {isSavingServing ? "Guardando..." : "Marcar como habitual"}
                  </p>
                  <p className="text-xs text-gray-500">Para este paciente</p>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  isHabitual ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    isHabitual ? "left-7" : "left-1"
                  }`}
                />
              </div>
            </button>
            {servingError && (
              <p className="text-xs text-red-500 text-center">{servingError}</p>
            )}
          </div>
        </div>

        <div className="p-6 pt-2 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-12 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(food, Math.round(weight), "g")}
            className="h-12 text-sm font-bold bg-green-600 text-white hover:bg-green-700 rounded-2xl transition-colors shadow-lg shadow-green-500/20"
          >
            Añadir al plato
          </button>
        </div>
      </div>
    </div>
  );
};
