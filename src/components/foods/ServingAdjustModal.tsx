import React, { useState } from "react";
import BottomSheet from "../common/BottomSheet";

interface ServingAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: {
    food_id: number;
    food_name: string;
    current_serving?: number | null;
    unit?: string | null;
  };
  onSave: (foodId: number, servingSize: number, unit: string) => Promise<void>;
}

const ServingAdjustModal: React.FC<ServingAdjustModalProps> = ({
  isOpen,
  onClose,
  food,
  onSave,
}) => {
  const [servingSize, setServingSize] = useState(
    food.current_serving != null ? String(food.current_serving) : "",
  );
  const [unit, setUnit] = useState(food.unit ?? "g");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const size = parseFloat(servingSize);
    if (!servingSize || isNaN(size) || size <= 0) {
      setError("Ingresa una cantidad válida mayor a 0");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(food.food_id, size, unit);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Ajustar porción">
      <div className="py-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {food.food_name}
          </p>

          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Porción personalizada
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              placeholder="0"
              className="flex-1 px-3 py-2.5 text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="g"
              className="w-20 px-3 py-2.5 text-base sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {food.current_serving != null && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Porción actual: {food.current_serving} {food.unit}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-3 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!servingSize || saving}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar porción"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default ServingAdjustModal;
