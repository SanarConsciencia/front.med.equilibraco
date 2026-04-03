import { useState } from "react";
import { useMicStore } from "../../stores/micStore";

export function EditModeModal({
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

export function EditNameModal({
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
