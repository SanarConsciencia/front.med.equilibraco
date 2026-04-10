import React, { useEffect, useState } from "react";
import { useCitasStore } from "../../stores/citasStore";
import { useAppStore } from "../../stores/appStore";
import { Button } from "../ui";
import type {
  CitaResponse,
  EstadoCita,
  EvaluacionPreConsulta,
  SlotDisponible,
  TipoAgenda,
} from "../../types/agendaTypes";
import { PERFIL_BADGE_COLOR } from "../../types/agendaTypes";
import {
  ESTADO_CITA_LABEL,
  ESTADO_CITA_COLOR,
  TRANSICIONES_MEDICO,
  formatFechaCita,
  formatHora,
  todayColombia,
} from "../../types/agendaTypes";
import { citasApi, disponibilidadApi } from "../../services/agendaApi";

// ── Subvista: cambiar estado ───────────────────────────────────────────────────

const CambiarEstadoView: React.FC<{
  cita: CitaResponse;
  onBack: () => void;
  onDone: () => void;
}> = ({ cita, onBack, onDone }) => {
  const { token } = useAppStore();
  const { actualizarEstado } = useCitasStore();
  const [notas, setNotas] = useState("");
  const [estadoSel, setEstadoSel] = useState<EstadoCita | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transiciones = TRANSICIONES_MEDICO[cita.estado] ?? [];

  const handleConfirmar = async () => {
    if (!token || !estadoSel) return;
    setGuardando(true);
    setError(null);
    try {
      await actualizarEstado(token, cita.id, {
        estado: estadoSel,
        notas_medico: notas.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Nuevo estado:
      </p>

      <div className="space-y-2">
        {(transiciones || []).map((estado) => (
          <button
            key={estado}
            type="button"
            onClick={() => setEstadoSel(estado)}
            className={`
              w-full p-3 rounded-xl border text-left transition-all
              ${
                estadoSel === estado
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
              }
            `}
          >
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-full ${ESTADO_CITA_COLOR[estado]}`}
            >
              {ESTADO_CITA_LABEL[estado]}
            </span>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Notas médicas <span className="font-normal">(opcional)</span>
        </label>
        <textarea
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Observaciones, indicaciones…"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Atrás
        </Button>
        <Button
          size="sm"
          onClick={handleConfirmar}
          disabled={!estadoSel || guardando}
          className="flex-1"
        >
          {guardando ? "Guardando…" : "Confirmar cambio"}
        </Button>
      </div>
    </div>
  );
};

// ── Subvista: reagendar ───────────────────────────────────────────────────────

const ReagendarView: React.FC<{
  cita: CitaResponse;
  onBack: () => void;
  onDone: () => void;
}> = ({ cita, onBack, onDone }) => {
  const { token } = useAppStore();
  const { reagendar } = useCitasStore();

  const [fecha, setFecha] = useState(todayColombia());
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [slotSel, setSlotSel] = useState<SlotDisponible | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarSlots = async (f: string) => {
    if (!token) return;
    setLoadingSlots(true);
    setSlots([]);
    setSlotSel(null);
    setError(null);
    try {
      const data = await disponibilidadApi.getSlots(
        token,
        f,
        cita.tipo_cita as TipoAgenda,
      );
      setSlots(data.slots);
    } catch {
      setError("No se pudo cargar la disponibilidad");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleFechaChange = (f: string) => {
    setFecha(f);
    if (f) cargarSlots(f);
  };

  const handleConfirmar = async () => {
    if (!token || !slotSel) return;
    setGuardando(true);
    setError(null);
    try {
      await reagendar(token, cita.id, {
        fecha_hora_inicio: slotSel.inicio_colombia,
        duracion_minutos: cita.duracion_minutos,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reagendar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Nueva fecha
        </label>
        <input
          type="date"
          value={fecha}
          min={todayColombia()}
          onChange={(e) => handleFechaChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {loadingSlots && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
        </div>
      )}

      {!loadingSlots && slots.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Horario disponible
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
            {slots.map((slot) => (
              <button
                key={slot.inicio_colombia}
                type="button"
                onClick={() => setSlotSel(slot)}
                className={`
                  py-2 px-1 rounded-lg text-sm font-medium border transition-all
                  ${
                    slotSel?.inicio_colombia === slot.inicio_colombia
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400"
                  }
                `}
              >
                {formatHora(slot.inicio_colombia)}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loadingSlots && fecha && slots.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Sin disponibilidad para este día
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Atrás
        </Button>
        <Button
          size="sm"
          onClick={handleConfirmar}
          disabled={!slotSel || guardando}
          className="flex-1"
        >
          {guardando ? "Reagendando…" : "Confirmar reagendado"}
        </Button>
      </div>
    </div>
  );
};

// ── Modal principal ───────────────────────────────────────────────────────────

type Vista = "detalle" | "cambiarEstado" | "reagendar";

interface Props {
  cita: CitaResponse | null;
  onClose: () => void;
}

const CitaDetailModal: React.FC<Props> = ({ cita, onClose }) => {
  const { token } = useAppStore();
  const [vista, setVista] = useState<Vista>("detalle");
  const [meetCopiado, setMeetCopiado] = useState(false);
  const [evaluacion, setEvaluacion] = useState<EvaluacionPreConsulta | null>(
    null,
  );
  const [loadingEval, setLoadingEval] = useState(false);

  useEffect(() => {
    if (!cita || cita.tipo_cita !== "DESCUBRIMIENTO" || !token) {
      setEvaluacion(null);
      return;
    }
    let cancelled = false;
    setLoadingEval(true);
    citasApi
      .getEvaluacionByCita(token, cita.id)
      .then((data) => {
        if (!cancelled) setEvaluacion(data);
      })
      .catch(() => {
        if (!cancelled) setEvaluacion(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingEval(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cita?.id, cita?.tipo_cita, token]); // using optional chaining ids intentionally

  const copiarMeetLink = () => {
    if (!cita?.meet_link) return;
    navigator.clipboard.writeText(cita.meet_link).then(() => {
      setMeetCopiado(true);
      setTimeout(() => setMeetCopiado(false), 2000);
    });
  };

  if (!cita) return null;

  const transiciones = TRANSICIONES_MEDICO[cita.estado] ?? [];
  const puedeReagendar =
    cita.estado === "PENDIENTE" || cita.estado === "CONFIRMADA";

  const handleClose = () => {
    setVista("detalle");
    onClose();
  };

  const titulo: Record<Vista, string> = {
    detalle: "Detalle de cita",
    cambiarEstado: "Cambiar estado",
    reagendar: "Reagendar cita",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {titulo[vista]}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
        <div className="p-5 overflow-y-auto flex-1">
          {vista === "detalle" && (
            <div className="space-y-5">
              {/* Estado */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold px-3 py-1.5 rounded-full ${ESTADO_CITA_COLOR[cita.estado]}`}
                >
                  {ESTADO_CITA_LABEL[cita.estado]}
                </span>
                {cita.cita_original_id && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Cita reagendada
                  </span>
                )}
              </div>

              {/* Fecha y hora */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fecha y hora
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatFechaCita(cita.fecha_hora_inicio_colombia)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  {formatHora(cita.fecha_hora_inicio_colombia)} –{" "}
                  {formatHora(cita.fecha_hora_fin_colombia)}
                  <span className="text-gray-400 dark:text-gray-500 ml-2">
                    ({cita.duracion_minutos} min)
                  </span>
                </p>
              </div>

              {/* Meet link */}
              {cita.meet_link && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Link de sesión
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={cita.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                        />
                      </svg>
                      Unirse por Google Meet
                    </a>
                    <button
                      onClick={copiarMeetLink}
                      title="Copiar link"
                      className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {meetCopiado ? (
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
                      ) : (
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
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Paciente */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Paciente
                </p>
                <div className="space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {cita.customer_nombre}
                  </p>
                  {cita.customer_email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {cita.customer_email}
                    </p>
                  )}
                  {cita.customer_phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {cita.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Notas paciente */}
              {cita.notas_paciente && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Motivo / notas del paciente
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "{cita.notas_paciente}"
                  </p>
                </div>
              )}

              {/* Cuestionario de pre-consulta */}
              {cita.tipo_cita === "DESCUBRIMIENTO" &&
                (loadingEval || evaluacion) && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Cuestionario de pre-consulta
                    </p>

                    {loadingEval && (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500" />
                      </div>
                    )}

                    {!loadingEval && evaluacion && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">Perfil:</span>
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                            style={{
                              backgroundColor:
                                PERFIL_BADGE_COLOR[evaluacion.perfil],
                            }}
                          >
                            {evaluacion.perfil}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {(evaluacion.respuestas || []).map((r, i) => (
                            <div key={i}>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {r.pregunta}
                              </p>
                              <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                                → {r.respuesta}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

              {/* Notas médico */}
              {cita.notas_medico && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Notas médicas
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {cita.notas_medico}
                  </p>
                </div>
              )}

              {/* Token de cancelación */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Token de cancelación
                </p>
                <p className="text-xs font-mono text-gray-400 dark:text-gray-500 break-all">
                  {cita.token_cancelacion}
                </p>
              </div>

              {/* Acciones */}
              {(transiciones.length > 0 || puedeReagendar) && (
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {transiciones.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setVista("cambiarEstado")}
                      className="flex-1"
                    >
                      Cambiar estado
                    </Button>
                  )}
                  {puedeReagendar && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setVista("reagendar")}
                      className="flex-1"
                    >
                      Reagendar
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {vista === "cambiarEstado" && (
            <CambiarEstadoView
              cita={cita}
              onBack={() => setVista("detalle")}
              onDone={() => setVista("detalle")}
            />
          )}

          {vista === "reagendar" && (
            <ReagendarView
              cita={cita}
              onBack={() => setVista("detalle")}
              onDone={() => setVista("detalle")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CitaDetailModal;
