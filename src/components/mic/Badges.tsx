import type { MicObjectiveWithProgress, MicItem } from "../../types/micTypes";

export function ObjectiveTypeBadge({
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

export function ItemTypeBadge({ type }: { type: MicItem["item_type"] }) {
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
