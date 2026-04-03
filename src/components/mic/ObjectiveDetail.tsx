import { useState, useEffect } from "react";
import type {
  MicObjectiveWithProgress,
  MicItem,
  MicProgressUpdate,
  MicObjectiveCreate,
  MicItemCreate,
} from "../../types/micTypes";
import { useMicStore } from "../../stores/micStore";
import { ObjectiveTypeBadge, ItemTypeBadge } from "./Badges";
import { IconTrash, IconPlus } from "./Icons";
import { ItemDetailModal } from "./ItemDetailModal";

interface ObjectiveDetailProps {
  objective: MicObjectiveWithProgress;
  customerUuid: string;
  customerPhone: string | null;
  token: string;
  editMode: boolean;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
  stickyFooter?: boolean;
}

export function ObjectiveDetail({
  objective,
  customerUuid,
  customerPhone,
  token,
  editMode,
  onError,
  onSuccess,
  stickyFooter = false,
}: ObjectiveDetailProps) {
  const { updateProgress, editObjective, addItem, editItem, removeItem } =
    useMicStore();

  const [completed, setCompleted] = useState(
    objective.progress?.completed ?? false,
  );
  const [notes, setNotes] = useState(objective.progress?.notes ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [selectedItem, setSelectedItem] = useState<MicItem | null>(null);

  // Sync when objective changes
  useEffect(() => {
    setCompleted(objective.progress?.completed ?? false);
    setNotes(objective.progress?.notes ?? "");
    setSaveState("idle");
  }, [objective.id, objective.progress?.completed, objective.progress?.notes]);

  const handleSaveProgress = async () => {
    setSaveState("saving");
    try {
      const data: MicProgressUpdate = { completed, notes: notes || null };
      await updateProgress(customerUuid, objective.id, data, token);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      onSuccess("Progreso guardado");
    } catch (err) {
      setSaveState("idle");
      onError(err instanceof Error ? err.message : "Error guardando progreso");
    }
  };

  const handleEditField = async (
    field: Partial<Parameters<typeof editObjective>[1]>,
  ) => {
    try {
      await editObjective(objective.id, field);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al editar");
    }
  };

  const handleAddItem = async () => {
    try {
      await addItem(objective.id, {
        name: "Nuevo material",
        item_type: "guia",
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al agregar material");
    }
  };

  const handleEditItem = async (
    itemId: number,
    data: Partial<MicItemCreate>,
  ) => {
    try {
      await editItem(itemId, data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al editar material");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Error al eliminar material",
      );
    }
  };

  const progressFooter = (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="w-4 h-4 accent-green-600 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Marcar como completado
        </span>
      </label>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Notas del médico
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Observaciones..."
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>
      <button
        onClick={handleSaveProgress}
        disabled={saveState === "saving"}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60"
      >
        {saveState === "saving" && (
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
        )}
        {saveState === "saving"
          ? "Guardando..."
          : saveState === "saved"
            ? "✓ Guardado"
            : "Guardar progreso"}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            {editMode ? (
              <input
                defaultValue={objective.name}
                onBlur={(e) => handleEditField({ name: e.target.value })}
                className="flex-1 text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-green-500 pb-0.5"
              />
            ) : (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {objective.name}
              </h2>
            )}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ObjectiveTypeBadge type={objective.objective_type} />
              {objective.is_optional && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Optativo
                </span>
              )}
              {objective.is_intra && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  Intrasesión
                </span>
              )}
            </div>
          </div>

          {editMode && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <select
                  defaultValue={objective.objective_type}
                  onChange={(e) =>
                    handleEditField({
                      objective_type: e.target
                        .value as MicObjectiveCreate["objective_type"],
                    })
                  }
                  className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="teorico">Teórico</option>
                  <option value="practico">Práctico</option>
                  <option value="evaluativo">Evaluativo</option>
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={objective.is_optional}
                  onChange={(e) =>
                    handleEditField({ is_optional: e.target.checked })
                  }
                  className="accent-green-600"
                />
                Optativo
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={objective.is_intra}
                  onChange={(e) =>
                    handleEditField({ is_intra: e.target.checked })
                  }
                  className="accent-green-600"
                />
                Intrasesión
              </label>
            </div>
          )}
        </div>

        {/* Descripción */}
        {editMode ? (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Descripción
            </label>
            <textarea
              key={`desc-${objective.id}`}
              defaultValue={objective.description ?? ""}
              onBlur={(e) =>
                handleEditField({ description: e.target.value || null })
              }
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Descripción del objetivo..."
            />
          </div>
        ) : (
          objective.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {objective.description}
            </p>
          )
        )}

        {/* Criterio */}
        {editMode ? (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Criterio de cumplimiento
            </label>
            <textarea
              key={`crit-${objective.id}`}
              defaultValue={objective.criteria ?? ""}
              onBlur={(e) =>
                handleEditField({ criteria: e.target.value || null })
              }
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Criterio de cumplimiento..."
            />
          </div>
        ) : (
          objective.criteria && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Criterio de cumplimiento
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{objective.criteria}"
              </p>
            </div>
          )
        )}

        {/* Materiales */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Materiales
          </p>
          {objective.items.length === 0 && !editMode && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Sin materiales.
            </p>
          )}
          {editMode ? (
            <div className="space-y-2">
              {objective.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <select
                    defaultValue={item.item_type}
                    onChange={(e) =>
                      handleEditItem(item.id, {
                        item_type: e.target.value as MicItem["item_type"],
                      })
                    }
                    className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
                  >
                    <option value="guia">Guía</option>
                    <option value="mensaje_rapido">Mensaje rápido</option>
                    <option value="pdf_educativo">PDF Educativo</option>
                    <option value="video_educativo">Video Educativo</option>
                    <option value="contenido_social">Contenido Social</option>
                    <option value="protocolo">Protocolo</option>
                    <option value="checklist">Checklist</option>
                    <option value="receta">Receta</option>
                  </select>
                  <input
                    defaultValue={item.name}
                    onBlur={(e) =>
                      handleEditItem(item.id, { name: e.target.value })
                    }
                    placeholder="Nombre"
                    className="flex-1 min-w-0 text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
                  />
                  <input
                    defaultValue={item.url ?? ""}
                    onBlur={(e) =>
                      handleEditItem(item.id, { url: e.target.value || null })
                    }
                    placeholder="URL (opcional)"
                    className="w-28 text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <IconPlus />
                Agregar material
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {objective.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors text-left ${
                    item.description || item.url
                      ? "border-gray-200 dark:border-gray-700 hover:border-green-400 hover:text-green-700 dark:hover:text-green-400 cursor-pointer"
                      : "border-gray-200 dark:border-gray-700 cursor-default"
                  } bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300`}
                >
                  <ItemTypeBadge type={item.item_type} />
                  {item.name}
                  {(item.description || item.url) && (
                    <svg
                      className="w-3 h-3 text-gray-400 flex-shrink-0"
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
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer — no sticky en desktop */}
        {!stickyFooter && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            {progressFooter}
          </div>
        )}
      </div>

      {/* Footer sticky en móvil */}
      {stickyFooter && (
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 space-y-3 md:hidden">
          {progressFooter}
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          customerPhone={customerPhone}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
