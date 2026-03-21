import React, { useState, useEffect } from "react";
import { ModalSheet } from "../ui/ModalSheet";

export interface MealFormData {
  meal_name: string;
  meal_time: string;
  notes: string;
}

interface MealFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Partial<MealFormData>;
  onClose: () => void;
  onSave: (data: MealFormData) => Promise<void>;
}

const MealFormModal: React.FC<MealFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}) => {
  const [mealName, setMealName] = useState(initialData?.meal_name ?? "");
  const [mealTime, setMealTime] = useState(initialData?.meal_time ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setMealName(initialData?.meal_name ?? "");
      setMealTime(initialData?.meal_time ?? "");
      setNotes(initialData?.notes ?? "");
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) {
      setError("El nombre del plato es requerido");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        meal_name: mealName.trim(),
        meal_time: mealTime,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} centerOnDesktop>
      {/* Content — no touch-none so inner scroll can work freely */}
      <div className="px-5 pb-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {mode === "create" ? "Agregar plato" : "Editar plato"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-4 h-4"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Meal name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Nombre del plato *
            </label>
            {/* font-size >= 16px prevents iOS auto-zoom on focus */}
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Ej: Desayuno, Ensalada de pollo..."
              className="w-full px-3 py-2.5 text-base rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Meal time */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Hora (opcional)
            </label>
            <input
              type="time"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="w-full px-3 py-2.5 text-base rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones del plato..."
              rows={2}
              className="w-full px-3 py-2.5 text-base rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 resize-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 min-h-[44px] py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-[44px] py-2.5 text-sm font-medium rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? "Guardando..."
                : mode === "create"
                  ? "Crear plato"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </ModalSheet>
  );
};

export default MealFormModal;
