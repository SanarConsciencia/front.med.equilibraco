import React, { useState } from "react";
import BottomSheet from "../common/BottomSheet";

interface MealNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealName: string;
  currentNote?: string | null;
  onSave: (note: string) => Promise<void>;
}

const MealNoteModal: React.FC<MealNoteModalProps> = ({
  isOpen,
  onClose,
  mealName,
  currentNote,
  onSave,
}) => {
  const [note, setNote] = useState(currentNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave(note.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Nota médica — ${mealName}`}
    >
      <div className="py-4 space-y-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escribe tu observación clínica sobre este plato..."
          rows={5}
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />

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
            disabled={!note.trim() || saving}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar nota"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default MealNoteModal;
