import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/appStore";
import { useMicStore } from "../stores/micStore";
import type { Customer } from "../services/api";
import type {
  MicPillarWithPhases,
  MicPhaseWithObjectives,
  MicObjectiveWithProgress,
  MicItem,
  MicProgressUpdate,
  MicObjectiveCreate,
  MicItemCreate,
} from "../types/micTypes";

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastState {
  id: number;
  message: string;
  type: "error" | "success";
}

let _toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = (message: string, type: ToastState["type"] = "error") => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  return { toasts, show };
}

function ToastContainer({ toasts }: { toasts: ToastState[] }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white ${
            t.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Modal de activación ───────────────────────────────────────────────────────

function EditModeModal({
  onClose,
  onActivate,
}: {
  onClose: () => void;
  onActivate: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const { activateEditMode } = useMicStore();

  const handleActivate = () => {
    const ok = activateEditMode(value);
    if (ok) {
      onActivate();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Modo edición MIC
        </h2>
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Ingresa la clave de admin:
          </label>
          <input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleActivate()}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          {error && <p className="text-xs text-red-500">Clave incorrecta</p>}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleActivate}
            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
          >
            Activar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal edición de nombre ───────────────────────────────────────────────────

function EditNameModal({
  initialValue,
  label,
  onSave,
  onClose,
}: {
  initialValue: string;
  label: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await onSave(value.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {label}
        </h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bottom sheet (móvil) ──────────────────────────────────────────────────────

interface BottomSheetOption {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function BottomSheet({
  options,
  onClose,
}: {
  options: BottomSheetOption[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-4 space-y-1">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              opt.onClick();
              onClose();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              opt.danger
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Iconos SVG inline ─────────────────────────────────────────────────────────

const IconEdit = () => (
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
);

const IconTrash = () => (
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
);

const IconPlus = () => (
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
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const IconChevronDown = () => (
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
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const IconChevronRight = () => (
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// ── Badge de tipo de objetivo ─────────────────────────────────────────────────

function ObjectiveTypeBadge({
  type,
}: {
  type: MicObjectiveWithProgress["objective_type"];
}) {
  const map = {
    teorico: {
      label: "Teórico",
      cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    practico: {
      label: "Práctico",
      cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    evaluativo: {
      label: "Evaluativo",
      cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
  };
  const { label, cls } = map[type];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function ItemTypeBadge({ type }: { type: MicItem["item_type"] }) {
  const map = {
    pdf: {
      label: "PDF",
      cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    mensaje_rapido: {
      label: "Mensaje rápido",
      cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    guia: {
      label: "Guía",
      cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    otro: {
      label: "Otro",
      cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
  };
  const { label, cls } = map[type];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ── Modal detalle de material ─────────────────────────────────────────────────

interface ItemDetailModalProps {
  item: MicItem;
  customerPhone: string | null;
  onClose: () => void;
}

function ItemDetailModal({
  item,
  customerPhone,
  onClose,
}: ItemDetailModalProps) {
  const [phone, setPhone] = useState(customerPhone ?? "");
  const [copied, setCopied] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const handleCopy = async () => {
    if (!item.description) return;
    try {
      await navigator.clipboard.writeText(item.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = item.description;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendWhatsApp = () => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return;
    const text = item.description ?? item.name;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
      <div className="w-full md:max-w-lg md:mx-4 bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <ItemTypeBadge type={item.item_type} />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {item.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {item.description ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
              {item.description}
            </pre>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              Sin descripción.
            </p>
          )}

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium underline underline-offset-2"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {item.url}
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-3">
          {showWhatsApp ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Número de WhatsApp
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSendWhatsApp}
                  disabled={!phone.replace(/\D/g, "")}
                  className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  Enviar
                </button>
                <button
                  onClick={() => setShowWhatsApp(false)}
                  className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {item.description && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-4 h-4 text-green-500"
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
                      Copiado
                    </>
                  ) : (
                    <>
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copiar
                    </>
                  )}
                </button>
              )}
              {item.description && (
                <button
                  onClick={() => setShowWhatsApp(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enviar por WhatsApp
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Panel derecho — contenido del objetivo ────────────────────────────────────

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

function ObjectiveDetail({
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
        item_type: "otro",
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
                    <option value="pdf">PDF</option>
                    <option value="mensaje_rapido">Mensaje rápido</option>
                    <option value="guia">Guía</option>
                    <option value="otro">Otro</option>
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
          <>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              {progressFooter}
            </div>
          </>
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

// ── Sidebar — árbol de navegación ─────────────────────────────────────────────

interface TreeProps {
  pillars: MicPillarWithPhases[];
  selectedObjectiveId: number | null;
  editMode: boolean;
  onSelect: (objId: number, pillarId: number, phaseId: number) => void;
  onError: (msg: string) => void;
  mobileMode?: boolean;
}

function MicTree({
  pillars,
  selectedObjectiveId,
  editMode,
  onSelect,
  onError,
  mobileMode = false,
}: TreeProps) {
  const {
    addPillar,
    editPillar,
    removePillar,
    addPhase,
    editPhase,
    removePhase,
    addObjective,
    editObjective,
    removeObjective,
    setMobileView,
  } = useMicStore();

  const [expandedPillars, setExpandedPillars] = useState<Set<number>>(
    () => new Set(pillars.map((p) => p.id)),
  );
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    () => new Set(pillars.flatMap((p) => p.phases.map((ph) => ph.id))),
  );

  // Sheet state (mobile)
  const [sheet, setSheet] = useState<{
    options: { label: string; onClick: () => void; danger?: boolean }[];
  } | null>(null);

  // Edit name modal
  const [editNameModal, setEditNameModal] = useState<{
    label: string;
    initial: string;
    onSave: (v: string) => Promise<void>;
  } | null>(null);

  const togglePillar = (id: number) => {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePhase = (id: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddPillar = async () => {
    try {
      await addPillar({ name: "Nuevo pilar" });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al agregar pilar");
    }
  };

  const handleAddPhase = async (pillarId: number) => {
    try {
      await addPhase(pillarId, { name: "Nueva fase" });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al agregar fase");
    }
  };

  const handleAddObjective = async (phaseId: number) => {
    try {
      await addObjective(phaseId, {
        name: "Nuevo objetivo",
        objective_type: "teorico",
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al agregar objetivo");
    }
  };

  const handleRemovePillar = async (id: number) => {
    try {
      await removePillar(id);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al eliminar pilar");
    }
  };

  const handleRemovePhase = async (id: number) => {
    try {
      await removePhase(id);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al eliminar fase");
    }
  };

  const handleRemoveObjective = async (id: number) => {
    try {
      await removeObjective(id);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Error al eliminar objetivo",
      );
    }
  };

  const openMobileSheetForPillar = (pillar: MicPillarWithPhases) => {
    setSheet({
      options: [
        {
          label: "Editar nombre",
          onClick: () =>
            setEditNameModal({
              label: "Editar pilar",
              initial: pillar.name,
              onSave: async (v) => {
                try {
                  await editPillar(pillar.id, { name: v });
                } catch (err) {
                  onError(err instanceof Error ? err.message : "Error");
                }
              },
            }),
        },
        {
          label: "+ Agregar fase",
          onClick: () => handleAddPhase(pillar.id),
        },
        {
          label: "Eliminar pilar",
          danger: true,
          onClick: () => handleRemovePillar(pillar.id),
        },
      ],
    });
  };

  const openMobileSheetForPhase = (phase: MicPhaseWithObjectives) => {
    setSheet({
      options: [
        {
          label: "Editar nombre",
          onClick: () =>
            setEditNameModal({
              label: "Editar fase",
              initial: phase.name,
              onSave: async (v) => {
                try {
                  await editPhase(phase.id, { name: v });
                } catch (err) {
                  onError(err instanceof Error ? err.message : "Error");
                }
              },
            }),
        },
        {
          label: "+ Agregar objetivo",
          onClick: () => handleAddObjective(phase.id),
        },
        {
          label: "Eliminar fase",
          danger: true,
          onClick: () => handleRemovePhase(phase.id),
        },
      ],
    });
  };

  const openMobileSheetForObjective = (obj: MicObjectiveWithProgress) => {
    setSheet({
      options: [
        {
          label: "Editar nombre",
          onClick: () =>
            setEditNameModal({
              label: "Editar objetivo",
              initial: obj.name,
              onSave: async (v) => {
                try {
                  await editObjective(obj.id, { name: v });
                } catch (err) {
                  onError(err instanceof Error ? err.message : "Error");
                }
              },
            }),
        },
        {
          label: "Eliminar objetivo",
          danger: true,
          onClick: () => handleRemoveObjective(obj.id),
        },
      ],
    });
  };

  return (
    <div className="space-y-1 py-2">
      {pillars.map((pillar) => (
        <div key={pillar.id}>
          {/* Pilar */}
          <div
            className={`flex items-center gap-1 px-3 py-2 cursor-pointer rounded-lg transition-colors ${
              expandedPillars.has(pillar.id)
                ? "bg-gray-50 dark:bg-gray-800"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <button
              onClick={() => togglePillar(pillar.id)}
              className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
            >
              <span className="text-gray-400 flex-shrink-0">
                {expandedPillars.has(pillar.id) ? (
                  <IconChevronDown />
                ) : (
                  <IconChevronRight />
                )}
              </span>
              <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {pillar.name}
              </span>
            </button>
            {editMode && !mobileMode && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() =>
                    setEditNameModal({
                      label: "Editar pilar",
                      initial: pillar.name,
                      onSave: async (v) => {
                        try {
                          await editPillar(pillar.id, { name: v });
                        } catch (err) {
                          onError(err instanceof Error ? err.message : "Error");
                        }
                      },
                    })
                  }
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  title="Editar nombre"
                >
                  <IconEdit />
                </button>
                <button
                  onClick={() => handleAddPhase(pillar.id)}
                  className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Agregar fase"
                >
                  <IconPlus />
                </button>
                <button
                  onClick={() => handleRemovePillar(pillar.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <IconTrash />
                </button>
              </div>
            )}
            {editMode && mobileMode && (
              <button
                onClick={() => openMobileSheetForPillar(pillar)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <span className="text-xs">···</span>
              </button>
            )}
          </div>

          {/* Fases */}
          {expandedPillars.has(pillar.id) && (
            <div className="ml-3 space-y-0.5">
              {pillar.phases.map((phase) => (
                <div key={phase.id}>
                  {/* Fase */}
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg">
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                    >
                      <span className="text-gray-400 flex-shrink-0">
                        {expandedPhases.has(phase.id) ? (
                          <IconChevronDown />
                        ) : (
                          <IconChevronRight />
                        )}
                      </span>
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate">
                        {phase.name}
                      </span>
                    </button>
                    {editMode && !mobileMode && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() =>
                            setEditNameModal({
                              label: "Editar fase",
                              initial: phase.name,
                              onSave: async (v) => {
                                try {
                                  await editPhase(phase.id, { name: v });
                                } catch (err) {
                                  onError(
                                    err instanceof Error
                                      ? err.message
                                      : "Error",
                                  );
                                }
                              },
                            })
                          }
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleAddObjective(phase.id)}
                          className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                          <IconPlus />
                        </button>
                        <button
                          onClick={() => handleRemovePhase(phase.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    )}
                    {editMode && mobileMode && (
                      <button
                        onClick={() => openMobileSheetForPhase(phase)}
                        className="p-1 text-gray-400"
                      >
                        <span className="text-xs">···</span>
                      </button>
                    )}
                  </div>

                  {/* Objetivos */}
                  {expandedPhases.has(phase.id) && (
                    <div className="ml-4 space-y-0.5">
                      {phase.objectives.map((obj) => {
                        const isSelected = obj.id === selectedObjectiveId;
                        const isDone = obj.progress?.completed ?? false;
                        return (
                          <div
                            key={obj.id}
                            onClick={() => {
                              onSelect(obj.id, pillar.id, phase.id);
                              if (mobileMode) setMobileView("detail");
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {/* Checkbox estado */}
                            <span className="flex-shrink-0">
                              {isDone ? (
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-gray-300 dark:text-gray-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                            </span>
                            <span
                              className={`flex-1 text-sm truncate ${
                                isDone
                                  ? "line-through text-gray-400 dark:text-gray-500"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {obj.name}
                            </span>
                            {mobileMode && <IconChevronRight />}
                            {editMode && !mobileMode && (
                              <div
                                className="flex items-center gap-0.5 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    setEditNameModal({
                                      label: "Editar objetivo",
                                      initial: obj.name,
                                      onSave: async (v) => {
                                        try {
                                          await editObjective(obj.id, {
                                            name: v,
                                          });
                                        } catch (err) {
                                          onError(
                                            err instanceof Error
                                              ? err.message
                                              : "Error",
                                          );
                                        }
                                      },
                                    })
                                  }
                                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                  <IconEdit />
                                </button>
                                <button
                                  onClick={() => handleRemoveObjective(obj.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <IconTrash />
                                </button>
                              </div>
                            )}
                            {editMode && mobileMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMobileSheetForObjective(obj);
                                }}
                                className="p-1 text-gray-400"
                              >
                                <span className="text-xs">···</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {editMode && !mobileMode && (
                        <button
                          onClick={() => handleAddObjective(phase.id)}
                          className="flex items-center gap-1.5 px-3 py-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                          <IconPlus />
                          Agregar objetivo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {editMode && !mobileMode && (
                <button
                  onClick={() => handleAddPhase(pillar.id)}
                  className="flex items-center gap-1.5 px-3 py-1 ml-3 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  <IconPlus />
                  Agregar fase
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {editMode && (
        <button
          onClick={handleAddPillar}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-green-600 hover:text-green-700 font-medium transition-colors w-full"
        >
          <IconPlus />
          Agregar pilar
        </button>
      )}

      {/* Bottom sheet (mobile) */}
      {sheet && (
        <BottomSheet options={sheet.options} onClose={() => setSheet(null)} />
      )}

      {/* Edit name modal */}
      {editNameModal && (
        <EditNameModal
          label={editNameModal.label}
          initialValue={editNameModal.initial}
          onSave={editNameModal.onSave}
          onClose={() => setEditNameModal(null)}
        />
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

const MicPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const customer = location.state?.customer as Customer | undefined;
  const patientName = customer?.customer_full_name ?? uuid ?? "—";

  const token = useAppStore((s) => s.token);

  const {
    pillars,
    isLoading,
    error,
    selectedObjectiveId,
    editMode,
    mobileView,
    loadProgress,
    selectObjective,
    deactivateEditMode,
    setMobileView,
  } = useMicStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { toasts, show: showToast } = useToast();

  useEffect(() => {
    if (uuid && token) {
      loadProgress(uuid, token).catch(console.error);
    }
  }, [uuid, token, loadProgress]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Find selected objective
  const selectedObjective = selectedObjectiveId
    ? (pillars
        .flatMap((p) => p.phases)
        .flatMap((ph) => ph.objectives)
        .find((o) => o.id === selectedObjectiveId) ?? null)
    : null;

  if (!uuid) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
        Paciente no encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ToastContainer toasts={toasts} />

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        {/* Móvil: volver al árbol si estamos en detalle */}
        {mobileView === "detail" ? (
          <button
            type="button"
            onClick={() => setMobileView("tree")}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              navigate(`/patients/${uuid}/day`, { state: { customer } })
            }
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Volver"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {patientName}
          </p>
          {customer?.customer_email && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {customer.customer_email}
            </p>
          )}
        </div>

        {/* Desktop: botón editar */}
        <div className="hidden md:flex items-center gap-2">
          {editMode ? (
            <button
              onClick={deactivateEditMode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700 transition-colors hover:bg-green-200"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Editando
            </button>
          ) : (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
              Editar MIC
            </button>
          )}
        </div>

        {/* Móvil: menú ··· */}
        <div className="md:hidden relative" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMobileMenu((v) => !v)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {showMobileMenu && (
            <div className="absolute right-0 top-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 w-44 z-20">
              {editMode ? (
                <button
                  onClick={() => {
                    deactivateEditMode();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Salir de edición
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Editar MIC
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 flex-1">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 dark:border-green-500" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex items-center justify-center py-20 flex-1">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 text-center space-y-3 max-w-sm mx-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => uuid && token && loadProgress(uuid, token)}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* DESKTOP layout */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-[280px] flex-shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-y-auto bg-white dark:bg-gray-900">
              {pillars.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay pilares configurados. Activa el modo edición para
                    comenzar.
                  </p>
                  {!editMode && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Activar modo edición
                    </button>
                  )}
                </div>
              ) : (
                <MicTree
                  pillars={pillars}
                  selectedObjectiveId={selectedObjectiveId}
                  editMode={editMode}
                  onSelect={selectObjective}
                  onError={(msg) => showToast(msg, "error")}
                />
              )}
              {editMode && pillars.length > 0 && (
                <div className="px-3 pb-4">
                  {/* add pillar button is inside MicTree */}
                </div>
              )}
            </div>

            {/* Panel derecho */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {selectedObjective && token ? (
                <ObjectiveDetail
                  key={selectedObjective.id}
                  objective={selectedObjective}
                  customerUuid={uuid}
                  customerPhone={customer?.customer_phone ?? null}
                  token={token}
                  editMode={editMode}
                  onError={(msg) => showToast(msg, "error")}
                  onSuccess={(msg) => showToast(msg, "success")}
                  stickyFooter={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Selecciona un objetivo del menú izquierdo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MÓVIL layout */}
          <div className="md:hidden flex-1">
            {mobileView === "tree" ? (
              <div className="overflow-y-auto bg-white dark:bg-gray-900 min-h-full">
                {pillars.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay pilares configurados. Activa el modo edición para
                      comenzar.
                    </p>
                    {!editMode && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        Activar modo edición
                      </button>
                    )}
                  </div>
                ) : (
                  <MicTree
                    pillars={pillars}
                    selectedObjectiveId={selectedObjectiveId}
                    editMode={editMode}
                    onSelect={selectObjective}
                    onError={(msg) => showToast(msg, "error")}
                    mobileMode
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col min-h-full bg-white dark:bg-gray-900">
                {selectedObjective && token ? (
                  <ObjectiveDetail
                    key={selectedObjective.id}
                    objective={selectedObjective}
                    customerUuid={uuid}
                    customerPhone={customer?.customer_phone ?? null}
                    token={token}
                    editMode={editMode}
                    onError={(msg) => showToast(msg, "error")}
                    onSuccess={(msg) => showToast(msg, "success")}
                    stickyFooter
                  />
                ) : (
                  <div className="flex items-center justify-center flex-1 p-6">
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Selecciona un objetivo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal activación edición */}
      {showEditModal && (
        <EditModeModal
          onClose={() => setShowEditModal(false)}
          onActivate={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default MicPage;
