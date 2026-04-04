import { useState } from "react";
import type {
  MicPillarWithPhases,
  MicPhaseWithObjectives,
  MicObjectiveWithProgress,
} from "../../types/micTypes";
import { useMicStore } from "../../stores/micStore";
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconTrash,
} from "./Icons";
import { BottomSheet } from "./BottomSheet";
import { EditNameModal } from "./Modals";

interface MicTreeProps {
  pillars: MicPillarWithPhases[];
  selectedObjectiveId: number | null;
  editMode: boolean;
  onSelect: (objId: number, pillarId: number, phaseId: number) => void;
  onError: (msg: string) => void;
  mobileMode?: boolean;
}

export function MicTree({
  pillars,
  selectedObjectiveId,
  editMode,
  onSelect,
  onError,
  mobileMode = false,
}: MicTreeProps) {
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

  const [sheet, setSheet] = useState<{
    options: { label: string; onClick: () => void; danger?: boolean }[];
  } | null>(null);

  const [editNameModal, setEditNameModal] = useState<{
    label: string;
    initial: string;
    onSave: (v: string) => Promise<void>;
  } | null>(null);

  const togglePillar = (id: number) => {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePhase = (id: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
                  await editPillar(pillar.id, {
                    name: v,
                    description: (pillar as any).description ?? null,
                    order: pillar.order,
                  });
                } catch (err) {
                  onError(err instanceof Error ? err.message : "Error");
                }
              },
            }),
        },
        { label: "+ Agregar fase", onClick: () => handleAddPhase(pillar.id) },
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
                  await editPhase(phase.id, {
                    name: v,
                    description: (phase as any).description ?? null,
                    order: phase.order,
                  });
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
                  await editObjective(obj.id, {
                    name: v,
                    objective_type: obj.objective_type,
                    description: obj.description ?? null,
                    is_optional: obj.is_optional,
                    is_intra: obj.is_intra,
                    criteria: obj.criteria ?? null,
                    order: obj.order,
                  });
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
                          await editPillar(pillar.id, {
                            name: v,
                            description: (pillar as any).description ?? null,
                            order: pillar.order,
                          });
                        } catch (err) {
                          onError(err instanceof Error ? err.message : "Error");
                        }
                      },
                    })
                  }
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <IconEdit />
                </button>
                <button
                  onClick={() => handleAddPhase(pillar.id)}
                  className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <IconPlus />
                </button>
                <button
                  onClick={() => handleRemovePillar(pillar.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <IconTrash />
                </button>
              </div>
            )}
            {editMode && mobileMode && (
              <button
                onClick={() => openMobileSheetForPillar(pillar)}
                className="p-1 text-gray-400"
              >
                <span className="text-xs">···</span>
              </button>
            )}
          </div>

          {expandedPillars.has(pillar.id) && (
            <div className="ml-3 space-y-0.5">
              {pillar.phases.map((phase) => (
                <div key={phase.id}>
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
                                  await editPhase(phase.id, {
                                    name: v,
                                    description:
                                      (phase as any).description ?? null,
                                    order: phase.order,
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
                              className={`flex-1 text-sm truncate ${isDone ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}
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
                                            objective_type: obj.objective_type,
                                            description:
                                              obj.description ?? null,
                                            is_optional: obj.is_optional,
                                            is_intra: obj.is_intra,
                                            criteria: obj.criteria ?? null,
                                            order: obj.order,
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

      {sheet && (
        <BottomSheet options={sheet.options} onClose={() => setSheet(null)} />
      )}
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
