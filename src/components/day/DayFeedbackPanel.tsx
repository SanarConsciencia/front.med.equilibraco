import React, { useState } from "react";
import type { DayFeedback } from "../../types/medicalApiTypes";
import BottomSheet from "../common/BottomSheet";

interface DayFeedbackPanelProps {
  dayIntakeId: number;
  feedback?: DayFeedback | null;
  onSave: (contenido: string, score?: number) => Promise<void>;
}

const DayFeedbackPanel: React.FC<DayFeedbackPanelProps> = ({
  // dayIntakeId is used externally to correlate the panel with the right day
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dayIntakeId: _dayIntakeId,
  feedback,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contenido, setContenido] = useState(feedback?.contenido ?? "");
  const [score, setScore] = useState<string>(
    feedback?.score_general != null ? String(feedback.score_general) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setContenido(feedback?.contenido ?? "");
    setScore(
      feedback?.score_general != null ? String(feedback.score_general) : "",
    );
    setError("");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!contenido.trim()) return;
    setSaving(true);
    setError("");
    try {
      const scoreNum = score ? Number(score) : undefined;
      await onSave(contenido.trim(), scoreNum);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Retroalimentación del día
          </h3>
          <button
            type="button"
            onClick={handleOpen}
            className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
          >
            {feedback ? "Editar" : "+ Agregar"}
          </button>
        </div>

        {feedback ? (
          <div className="space-y-1">
            {feedback.score_general != null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-700 dark:text-blue-400">
                  Puntaje:
                </span>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  {feedback.score_general}/10
                </span>
              </div>
            )}
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              {feedback.contenido}
            </p>
          </div>
        ) : (
          <p className="text-xs text-blue-600 dark:text-blue-500 italic">
            Sin retroalimentación registrada para este día.
          </p>
        )}
      </div>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Retroalimentación del día"
      >
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Puntaje general (1–10) — opcional
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Ej. 8"
              className="w-24 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Comentario clínico
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe tu retroalimentación sobre el día completo del paciente..."
              rows={6}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pb-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!contenido.trim() || saving}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};

export default DayFeedbackPanel;
