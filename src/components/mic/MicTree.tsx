import { useState, useEffect } from "react";
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
import { ProtocolCard } from "./ProtocolCard";

interface MicTreeProps {
  pillars: MicPillarWithPhases[];
  customerId: string;
  token: string;
  selectedObjectiveId: number | null;
  editMode: boolean;
  onSelect: (objId: number, pillarId: number, phaseId: number) => void;
  onError: (msg: string) => void;
  mobileMode?: boolean;
}

export function MicTree({
  pillars,
  customerId,
  token,
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
    universalProtocols,
    pillarProtocols,
    loadUniversalProtocols,
    loadProtocolsForPillar,
  } = useMicStore();

  const [expandedPillars, setExpandedPillars] = useState<Set<number>>(
    () => new Set(pillars.map((p) => p.id)),
  );
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    () => new Set(pillars.flatMap((p) => p.phases.map((ph) => ph.id))),
  );
  const [showUniversalProtocols, setShowUniversalProtocols] = useState(false);

  const [sheet, setSheet] = useState<{
    options: { label: string; onClick: () => void; danger?: boolean }[];
  } | null>(null);

  const [editNameModal, setEditNameModal] = useState<{
    label: string;
    initial: string;
    onSave: (v: string) => Promise<void>;
  } | null>(null);

  useEffect(() => {
    loadUniversalProtocols();
  }, [loadUniversalProtocols]);

  const togglePillar = (pillar: MicPillarWithPhases) => {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(pillar.id)) {
        next.delete(pillar.id);
      } else {
        next.add(pillar.id);
        loadProtocolsForPillar(pillar.name);
      }
      return next;
    });
  };

  const expandPillarWithPhases = (pillar: MicPillarWithPhases) => {
    setExpandedPillars((prev) => new Set(prev).add(pillar.id));
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      pillar.phases.forEach((ph) => next.add(ph.id));
      return next;
    });
  };

  const collapsePillarWithPhases = (pillar: MicPillarWithPhases) => {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      next.delete(pillar.id);
      return next;
    });
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      pillar.phases.forEach((ph) => next.delete(ph.id));
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

  const expandAll = () => {
    setExpandedPillars(new Set(pillars.map((p) => p.id)));
    setExpandedPhases(
      new Set(pillars.flatMap((p) => p.phases.map((ph) => ph.id))),
    );
  };

  const collapseAll = () => {
    setExpandedPillars(new Set());
    setExpandedPhases(new Set());
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="space-y-1 py-1">
      {/* Global Controls - Sticky with backdrop blur */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          😎
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[10px] font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            Expandir todo
          </button>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <button
            onClick={collapseAll}
            className="text-[10px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Protocolos Universales */}
      <div className="mb-4">
        <button
          onClick={() => setShowUniversalProtocols(!showUniversalProtocols)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
            showUniversalProtocols
              ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
              : "bg-white border-gray-100 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                showUniversalProtocols
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span
              className={`text-[12px] font-bold ${
                showUniversalProtocols
                  ? "text-indigo-900 dark:text-indigo-100"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Protocolos universales ({universalProtocols.length})
            </span>
          </div>
          <span
            className={
              showUniversalProtocols ? "text-indigo-400" : "text-gray-400"
            }
          >
            {showUniversalProtocols ? (
              <IconChevronDown />
            ) : (
              <IconChevronRight />
            )}
          </span>
        </button>

        {showUniversalProtocols && (
          <div className="mt-1.5 ml-0 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {universalProtocols.length > 0 ? (
              universalProtocols.map((protocol) => (
                <ProtocolCard
                  key={protocol.id}
                  protocol={protocol}
                  customerId={customerId}
                  token={token}
                  editMode={editMode}
                />
              ))
            ) : (
              <p className="text-[10px] text-gray-400 italic px-4 py-2">
                No hay protocolos generales disponibles.
              </p>
            )}
          </div>
        )}
      </div>

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
              onClick={() => togglePillar(pillar)}
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

            {/* Pillar Helper Buttons */}
            <div className="flex items-center gap-1 px-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  expandPillarWithPhases(pillar);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[13px] text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold transition-all"
                title="Expandir todas las fases"
              >
                +
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  collapsePillarWithPhases(pillar);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all"
                title="Colapsar todas las fases"
              >
                −
              </button>
            </div>

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
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

              {/* Protocolos específicos del pilar - DESPUÉS de fases y objetivos */}
              <div className="mt-4 pb-2 space-y-1">
                <div className="px-3 pb-1 flex items-center gap-2">
                  <div className="p-1 px-1.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500">
                    <svg
                      className="w-3 h-3"
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
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-400 dark:text-indigo-500">
                    Protocolos {pillar.name} (
                    {pillarProtocols[pillar.name]?.length || 0})
                  </span>
                  <div className="h-px flex-1 bg-indigo-50 dark:bg-indigo-900/20" />
                </div>
                <div className="space-y-0.5">
                  {pillarProtocols[pillar.name]?.length > 0 ? (
                    pillarProtocols[pillar.name].map((protocol) => (
                      <ProtocolCard
                        key={protocol.id}
                        protocol={protocol}
                        customerId={customerId}
                        token={token}
                        editMode={editMode}
                      />
                    ))
                  ) : (
                    <p className="text-[10px] text-gray-400 italic px-4 py-2">
                      No hay protocolos específicos para este pilar.
                    </p>
                  )}
                </div>
              </div>
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
