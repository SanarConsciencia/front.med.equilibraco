import { useState, useEffect } from "react";
import type {
  MicObjectiveWithProgress,
  MicItem,
  MicProgressUpdate,
  MicObjectiveCreate,
} from "../../types/micTypes";
import { useMicStore } from "../../stores/micStore";
import { ObjectiveTypeBadge, ItemTypeBadge } from "./Badges";
import { IconTrash, IconPlus } from "./Icons";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
  const {
    updateProgress,
    editObjective,
    addItem,
    editItem,
    removeItem,
    fetchItemVisibility,
    toggleItemVisibility,
  } = useMicStore();
  const editModeStore = useMicStore((s) => s.editMode);
  const setIsDirtyStore = useMicStore((s) => s.setIsDirty);

  const [status, setStatus] = useState<
    "pending" | "en_curso" | "finalizada" | "abandonada"
  >(objective.progress?.status ?? "pending");
  const [notes, setNotes] = useState(objective.progress?.notes ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [selectedItem, setSelectedItem] = useState<MicItem | null>(null);
  const [itemVisibility, setItemVisibility] = useState<Record<number, boolean>>(
    {},
  );
  const [togglingItemId, setTogglingItemId] = useState<number | null>(null);

  // --- LOCAL EDIT STATE ---
  const [localName, setLocalName] = useState(objective.name);
  const [localType, setLocalType] = useState(objective.objective_type);
  const [localOptional, setLocalOptional] = useState(objective.is_optional);
  const [localIntra, setLocalIntra] = useState(objective.is_intra);
  const [localDesc, setLocalDesc] = useState(objective.description ?? "");
  const [localCriteria, setLocalCriteria] = useState(objective.criteria ?? "");
  const [localItems, setLocalItems] = useState<MicItem[]>(objective.items);

  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync isDirty with store
  useEffect(() => {
    setIsDirtyStore(isDirty);
    return () => setIsDirtyStore(false);
  }, [isDirty, setIsDirtyStore]);

  // Sync when objective changes
  useEffect(() => {
    setStatus(objective.progress?.status ?? "pending");
    setNotes(objective.progress?.notes ?? "");
    setSaveState("idle");

    // Reset local edit state
    setLocalName(objective.name);
    setLocalType(objective.objective_type);
    setLocalOptional(objective.is_optional);
    setLocalIntra(objective.is_intra);
    setLocalDesc(objective.description ?? "");
    setLocalCriteria(objective.criteria ?? "");
    setLocalItems(objective.items);
    setIsDirty(false);
  }, [
    objective.id,
    objective.progress?.status,
    objective.progress?.notes,
    objective.name,
    objective.objective_type,
    objective.is_optional,
    objective.is_intra,
    objective.description,
    objective.criteria,
    objective.items,
    editModeStore,
  ]);

  const updateLocalItem = (itemId: number, field: Partial<MicItem>) => {
    setLocalItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, ...field } : it)),
    );
    setIsDirty(true);
  };

  // Load item visibility (read mode only)
  useEffect(() => {
    if (editMode) return;
    void (async () => {
      try {
        const data = await fetchItemVisibility(customerUuid, token);
        const map: Record<number, boolean> = {};
        for (const it of data) {
          map[it.id] = true;
        }
        setItemVisibility(map);
      } catch {
        // ignore
      }
    })();
  }, [objective.id, customerUuid, editMode, token, fetchItemVisibility]);

  const handleToggleVisibility = async (itemId: number) => {
    const current = itemVisibility[itemId] ?? false;
    setTogglingItemId(itemId);
    try {
      await toggleItemVisibility(customerUuid, itemId, !current, token);
      setItemVisibility((prev) => ({ ...prev, [itemId]: !current }));
    } catch {
      // no change on error
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      // 1. Update Objective
      await editObjective(objective.id, {
        name: localName,
        objective_type: localType,
        description: localDesc || null,
        is_optional: localOptional,
        is_intra: localIntra,
        criteria: localCriteria || null,
        order: objective.order,
      });

      // 2. Update Items (Backend requires full object PUT)
      // Since localItems might have changes in name, type, url, desc, we iterate
      for (const item of localItems) {
        await editItem(item.id, {
          name: item.name,
          item_type: item.item_type,
          description: item.description || null,
          url: item.url || null,
          order: item.order,
        });
      }

      onSuccess("Objetivo actualizado");
      setIsDirty(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveProgress = async () => {
    setSaveState("saving");
    try {
      const data: MicProgressUpdate = {
        status,
        notes: notes || null,
        completed: status === "finalizada",
      };
      await updateProgress(customerUuid, objective.id, data, token);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      onSuccess("Progreso guardado");
    } catch (err) {
      setSaveState("idle");
      onError(err instanceof Error ? err.message : "Error guardando progreso");
    }
  };

  const handleAddItem = async () => {
    try {
      await addItem(objective.id, {
        name: "Nuevo material",
        item_type: "guia",
      });
      // Logic for manual save: usually adding an item is a direct API call or we wait for sync
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al agregar material");
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
      {/* Status pill selector */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Estado
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { value: "pending", label: "Pendiente" },
              { value: "en_curso", label: "En curso" },
              { value: "finalizada", label: "Finalizada" },
              { value: "abandonada", label: "Abandonada" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                status === opt.value
                  ? opt.value === "pending"
                    ? "border-gray-500 bg-gray-100 text-gray-600"
                    : opt.value === "en_curso"
                      ? "border-kiwi-500 bg-kiwi-500/20 text-kiwi-600"
                      : opt.value === "finalizada"
                        ? "border-green-500 bg-green-100 text-green-700"
                        : "border-red-400 bg-red-100 text-red-600"
                  : opt.value === "pending"
                    ? "border-gray-300 bg-gray-100 text-gray-600"
                    : opt.value === "en_curso"
                      ? "border-kiwi-500/40 bg-kiwi-500/10 text-kiwi-600"
                      : opt.value === "finalizada"
                        ? "border-green-400 bg-green-50 text-green-700"
                        : "border-red-300 bg-red-50 text-red-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
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
      {editMode && isDirty && (
        <button
          onClick={handleManualUpdate}
          disabled={isUpdating}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
        >
          {isUpdating && (
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
          )}
          {isUpdating ? "Actualizando..." : "Actualizar objetivo"}
        </button>
      )}
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
                value={localName}
                onChange={(e) => {
                  setLocalName(e.target.value);
                  setIsDirty(true);
                }}
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
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <select
                    value={localType}
                    onChange={(e) => {
                      setLocalType(
                        e.target.value as MicObjectiveCreate["objective_type"],
                      );
                      setIsDirty(true);
                    }}
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
                    checked={localOptional}
                    onChange={(e) => {
                      setLocalOptional(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="accent-green-600"
                  />
                  Optativo
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localIntra}
                    onChange={(e) => {
                      setLocalIntra(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="accent-green-600"
                  />
                  Intrasesión
                </label>
              </div>

              {isDirty && (
                <button
                  onClick={handleManualUpdate}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
                >
                  {isUpdating && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  )}
                  {isUpdating ? "Actualizando..." : "Actualizar"}
                </button>
              )}
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
              value={localDesc}
              onChange={(e) => {
                setLocalDesc(e.target.value);
                setIsDirty(true);
              }}
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
              value={localCriteria}
              onChange={(e) => {
                setLocalCriteria(e.target.value);
                setIsDirty(true);
              }}
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
              {localItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={item.item_type}
                      onChange={(e) =>
                        updateLocalItem(item.id, {
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
                      value={item.name}
                      onChange={(e) =>
                        updateLocalItem(item.id, { name: e.target.value })
                      }
                      placeholder="Nombre"
                      className="flex-1 min-w-0 text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
                    />
                    <input
                      value={item.url ?? ""}
                      onChange={(e) =>
                        updateLocalItem(item.id, { url: e.target.value })
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
                  <textarea
                    key={`desc-item-${item.id}`}
                    value={item.description ?? ""}
                    onChange={(e) =>
                      updateLocalItem(item.id, { description: e.target.value })
                    }
                    placeholder="Descripción (opcional)"
                    rows={2}
                    className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none w-full resize-none"
                  />
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
                <div key={item.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors text-left ${
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleToggleVisibility(item.id);
                    }}
                    disabled={togglingItemId === item.id}
                    title={
                      itemVisibility[item.id]
                        ? "Visible para el paciente"
                        : "No visible para el paciente"
                    }
                    className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                  >
                    {togglingItemId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                    ) : itemVisibility[item.id] ? (
                      <Eye className="w-3.5 h-3.5 text-kiwi-500" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — no sticky en desktop */}
        {!stickyFooter && !editMode && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            {progressFooter}
          </div>
        )}
      </div>

      {/* Footer sticky en móvil */}
      {stickyFooter && !editMode && (
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
