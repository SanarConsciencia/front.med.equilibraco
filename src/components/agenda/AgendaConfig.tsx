/**
 * AgendaConfig.tsx
 *
 * UI de configuración de agenda para KiwiPro.
 * Dos tabs independientes: Asistencial | Descubrimiento.
 *
 * Cada tab permite:
 * - Activar/desactivar días de la semana
 * - Configurar múltiples rangos horarios por día (ej: 8-10, 14-16, 18-19)
 * - Definir duración fija del slot para ese tipo
 * - Configurar buffer post-cita (tiempo personal del médico)
 *
 * Las dos agendas comparten la tabla de citas: el anti-cruce está en el backend.
 */

import React, { useEffect, useState } from "react";
import { useAgendaStore } from "../../stores/agendaStore";
import { useAppStore } from "../../stores/appStore";
import { Button } from "../ui";
import type {
  DiaAgendaForm,
  RangoHorario,
  TipoAgenda,
} from "../../types/agendaTypes";
import {
  DURACION_ASISTENCIAL_DEFAULT,
  DURACION_DESCUBRIMIENTO_DEFAULT,
} from "../../types/agendaTypes";

// ── Helpers ───────────────────────────────────────────────────────────────────

function validarRangos(rangos: RangoHorario[]): string | null {
  if (rangos.length === 0) return "Agrega al menos un rango horario";
  for (const r of rangos) {
    if (!r.inicio || !r.fin) return "Completa todos los rangos";
    if (r.fin <= r.inicio)
      return "El horario de fin debe ser posterior al de inicio";
  }
  // Verificar que los rangos no se solapen
  const sorted = [...rangos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].fin > sorted[i + 1].inicio) {
      return `Los rangos ${sorted[i].inicio}–${sorted[i].fin} y ${sorted[i + 1].inicio}–${sorted[i + 1].fin} se solapan`;
    }
  }
  return null;
}

// ── Subcomponente: editor de un rango horario ─────────────────────────────────

const RangoEditor: React.FC<{
  rango: RangoHorario;
  index: number;
  total: number;
  onChange: (r: RangoHorario) => void;
  onRemove: () => void;
  disabled: boolean;
}> = ({ rango, index, total, onChange, onRemove, disabled }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-400 dark:text-gray-500 w-4 flex-shrink-0">
      {index + 1}.
    </span>
    <input
      type="time"
      value={rango.inicio}
      onChange={(e) => onChange({ ...rango, inicio: e.target.value })}
      disabled={disabled}
      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600
                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
    />
    <span className="text-gray-400 text-xs flex-shrink-0">–</span>
    <input
      type="time"
      value={rango.fin}
      onChange={(e) => onChange({ ...rango, fin: e.target.value })}
      disabled={disabled}
      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600
                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
    />
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled || total <= 1}
      title="Eliminar rango"
      className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400
                 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

// ── Subcomponente: fila de un día ─────────────────────────────────────────────

const DiaRow: React.FC<{
  dia: DiaAgendaForm;
  onToggle: () => void;
  onEdit: () => void;
  onSave: (
    rangos: RangoHorario[],
    duracion: number,
    buffer: number,
  ) => Promise<void>;
  onCancel: () => void;
}> = ({ dia, onToggle, onEdit, onSave, onCancel }) => {
  const [rangos, setRangos] = useState<RangoHorario[]>(
    dia.rangos.length > 0 ? dia.rangos : [{ inicio: "08:00", fin: "10:00" }],
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar si cambian los props al volver del server
  useEffect(() => {
    setRangos(
      dia.rangos.length > 0 ? dia.rangos : [{ inicio: "08:00", fin: "10:00" }],
    );
    setError(null);
  }, [dia.rangos, dia.editando]);

  const addRango = () => {
    const ultimo = rangos[rangos.length - 1];
    // Sugerir un rango 2h después del último
    const [h] = ultimo.fin.split(":").map(Number);
    const nuevaInicio = `${String(Math.min(h + 1, 22)).padStart(2, "0")}:00`;
    const nuevaFin = `${String(Math.min(h + 3, 23)).padStart(2, "0")}:00`;
    setRangos([...rangos, { inicio: nuevaInicio, fin: nuevaFin }]);
  };

  const updateRango = (i: number, r: RangoHorario) => {
    const nuevo = [...rangos];
    nuevo[i] = r;
    setRangos(nuevo);
  };

  const removeRango = (i: number) => {
    setRangos(rangos.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    const err = validarRangos(rangos);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      // Leer duración y buffer del formulario padre si están disponibles
      await onSave(rangos, dia.duracion_minutos, dia.buffer_minutos);
    } catch {
      // error manejado por el store
    } finally {
      setGuardando(false);
    }
  };

  // Resumen de rangos para mostrar cuando no está editando
  const resumenRangos = dia.rangos
    .map((r) => `${r.inicio}–${r.fin}`)
    .join(", ");

  return (
    <div
      className={`rounded-xl border transition-all ${
        dia.is_active
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      }`}
    >
      {/* Cabecera del día */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Toggle */}
          <button
            type="button"
            onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none flex-shrink-0
              ${dia.is_active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
              transition-transform ${dia.is_active ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>

          <span
            className={`font-semibold text-sm w-24 flex-shrink-0 ${
              dia.is_active
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {dia.dia_nombre}
          </span>

          {/* Resumen cuando no edita */}
          {!dia.editando && dia.is_active && dia.rangos.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {resumenRangos}
            </span>
          )}
          {!dia.editando && dia.is_active && dia.rangos.length === 0 && (
            <span className="text-sm text-amber-600 dark:text-amber-400 italic">
              Sin rangos configurados
            </span>
          )}
          {!dia.editando && !dia.is_active && (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
              No disponible
            </span>
          )}
        </div>

        {dia.is_active && !dia.editando && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium flex-shrink-0 ml-2"
          >
            Editar
          </button>
        )}
      </div>

      {/* Panel de edición */}
      {dia.editando && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
          {/* Rangos horarios */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Franjas horarias
            </label>
            <div className="space-y-2">
              {rangos.map((rango, i) => (
                <RangoEditor
                  key={i}
                  rango={rango}
                  index={i}
                  total={rangos.length}
                  onChange={(r) => updateRango(i, r)}
                  onRemove={() => removeRango(i)}
                  disabled={guardando}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addRango}
              disabled={guardando || rangos.length >= 5}
              className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Agregar franja
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={guardando}
              className="min-w-[80px]"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={guardando}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Subcomponente: panel de configuración por tipo ────────────────────────────

const TipoPanel: React.FC<{ tipo: TipoAgenda }> = ({ tipo }) => {
  const { token } = useAppStore();
  const {
    fetchConfigs,
    upsertConfig,
    desactivarDia,
    loadingConfigs,
    errorConfigs,
    getFormDias,
  } = useAgendaStore();

  const [diasEditando, setDiasEditando] = useState<Set<number>>(new Set());

  // Configuración global para este tipo (duración y buffer aplican a todos los días)
  const duracionDefault =
    tipo === "ASISTENCIAL"
      ? DURACION_ASISTENCIAL_DEFAULT
      : DURACION_DESCUBRIMIENTO_DEFAULT;
  const bufferDefault = tipo === "DESCUBRIMIENTO" ? 20 : 0;

  const [duracionMinutos, setDuracionMinutos] = useState<number | "">(
    duracionDefault,
  );
  const [bufferMinutos, setBufferMinutos] = useState<number | "">(
    bufferDefault,
  );
  const [guardandoGlobal, setGuardandoGlobal] = useState(false);

  useEffect(() => {
    if (token) fetchConfigs(token, tipo);
  }, [token, tipo, fetchConfigs]);

  const dias = getFormDias(tipo);
  const [hasSyncedInitial, setHasSyncedInitial] = useState(false);

  // Sincronizar duración y buffer desde la primera config activa que encuentre (solo una vez)
  useEffect(() => {
    if (hasSyncedInitial || dias.length === 0) return;

    const primeraActiva = dias.find((d) => d.is_active && d.rangos.length > 0);
    if (primeraActiva) {
      setDuracionMinutos(primeraActiva.duracion_minutos);
      setBufferMinutos(primeraActiva.buffer_minutos);
      setHasSyncedInitial(true);
    }
  }, [dias, hasSyncedInitial]);

  const handleSaveGlobal = async () => {
    if (!token || duracionMinutos === "" || bufferMinutos === "") return;
    setGuardandoGlobal(true);
    try {
      // Actualizamos todos los días activos con la nueva duración/buffer
      const promesas = dias
        .filter((d) => d.is_active)
        .map((dia) =>
          upsertConfig(token, {
            dia_semana: dia.dia_semana,
            tipo,
            rangos: dia.rangos,
            duracion_minutos: Number(duracionMinutos),
            buffer_minutos: Number(bufferMinutos),
            is_active: true,
          }),
        );

      await Promise.all(promesas);
    } finally {
      setGuardandoGlobal(false);
    }
  };

  const handleToggleActive = async (diaSemana: number, isActive: boolean) => {
    if (!token) return;
    const dia = dias.find((d) => d.dia_semana === diaSemana);
    if (!dia) return;

    if (isActive) {
      // Desactivar
      try {
        await desactivarDia(token, diaSemana, tipo);
        setDiasEditando((prev) => {
          const s = new Set(prev);
          s.delete(diaSemana);
          return s;
        });
      } catch {
        /* el store maneja el error */
      }
    } else {
      // Activar con rangos vacíos — el usuario tendrá que editarlos
      try {
        await upsertConfig(token, {
          dia_semana: diaSemana,
          tipo,
          rangos:
            dia.rangos.length > 0
              ? dia.rangos
              : [{ inicio: "08:00", fin: "10:00" }],
          duracion_minutos: Number(duracionMinutos || 0),
          buffer_minutos: Number(bufferMinutos || 0),
          is_active: true,
        });
        // Abrir automáticamente en edición para que configure los rangos
        setDiasEditando((prev) => new Set(prev).add(diaSemana));
      } catch {
        /* el store maneja el error */
      }
    }
  };

  const handleSave = async (diaSemana: number, rangos: RangoHorario[]) => {
    if (!token) return;
    await upsertConfig(token, {
      dia_semana: diaSemana,
      tipo,
      rangos,
      duracion_minutos: Number(duracionMinutos || 0),
      buffer_minutos: Number(bufferMinutos || 0),
      is_active: true,
    });
    setDiasEditando((prev) => {
      const s = new Set(prev);
      s.delete(diaSemana);
      return s;
    });
  };

  if (loadingConfigs) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Configuración global del tipo */}
      <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Configuración global — aplica a todos los días de este tipo
          </h4>
          <Button
            size="sm"
            onClick={handleSaveGlobal}
            disabled={guardandoGlobal || dias.every((d) => !d.is_active)}
          >
            {guardandoGlobal ? "Guardando..." : "Guardar global"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duración del slot */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Duración de cada cita
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={duracionMinutos}
                onChange={(e) =>
                  setDuracionMinutos(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                minutos
              </span>
            </div>
            {tipo === "DESCUBRIMIENTO" && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Sesiones de descubrimiento: 40 min recomendado
              </p>
            )}
          </div>

          {/* Buffer post-cita */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tiempo personal post-cita
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={120}
                step={5}
                value={bufferMinutos}
                onChange={(e) =>
                  setBufferMinutos(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                minutos
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Nadie puede agendar durante este tiempo
            </p>
          </div>
        </div>

        {/* Explicación del buffer */}
        {Number(bufferMinutos) > 0 && (
          <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Ejemplo: cita de {duracionMinutos} min a las 9:00 → termina a las{" "}
              {String(9 + Math.floor(Number(duracionMinutos) / 60)).padStart(
                2,
                "0",
              )}
              :{String(Number(duracionMinutos) % 60).padStart(2, "0")}. El
              tiempo personal ocupa hasta las{" "}
              {String(
                9 +
                  Math.floor(
                    (Number(duracionMinutos) + Number(bufferMinutos)) / 60,
                  ),
              ).padStart(2, "0")}
              :
              {String(
                (Number(duracionMinutos) + Number(bufferMinutos)) % 60,
              ).padStart(2, "0")}
              . El siguiente slot disponible es a las{" "}
              {String(
                9 +
                  Math.floor(
                    (Number(duracionMinutos) + Number(bufferMinutos)) / 60,
                  ),
              ).padStart(2, "0")}
              :
              {String(
                (Number(duracionMinutos) + Number(bufferMinutos)) % 60,
              ).padStart(2, "0")}
              .
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {errorConfigs && (
        <div
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        rounded-lg text-sm text-red-600 dark:text-red-400"
        >
          {errorConfigs}
        </div>
      )}

      {/* Lista de días */}
      <div className="space-y-3">
        {dias.map((dia) => (
          <DiaRow
            key={dia.dia_semana}
            dia={{
              ...dia,
              duracion_minutos: Number(duracionMinutos),
              buffer_minutos: Number(bufferMinutos),
              editando: diasEditando.has(dia.dia_semana),
            }}
            onToggle={() => handleToggleActive(dia.dia_semana, dia.is_active)}
            onEdit={() =>
              setDiasEditando((prev) => new Set(prev).add(dia.dia_semana))
            }
            onSave={(rangos) => handleSave(dia.dia_semana, rangos)}
            onCancel={() =>
              setDiasEditando((prev) => {
                const s = new Set(prev);
                s.delete(dia.dia_semana);
                return s;
              })
            }
          />
        ))}
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

type TabTipo = "ASISTENCIAL" | "DESCUBRIMIENTO";

const AgendaConfig: React.FC = () => {
  const [tabActivo, setTabActivo] = useState<TabTipo>("ASISTENCIAL");

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Horario semanal
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Configura por separado las citas clínicas y las sesiones de
          descubrimiento
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTabActivo("ASISTENCIAL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              tabActivo === "ASISTENCIAL"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
        >
          🩺 Citas asistenciales
        </button>
        <button
          type="button"
          onClick={() => setTabActivo("DESCUBRIMIENTO")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              tabActivo === "DESCUBRIMIENTO"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
        >
          🌱 Sesiones de descubrimiento
        </button>
      </div>

      {/* Nota informativa */}
      <div
        className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400
                      bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3
                      border border-blue-100 dark:border-blue-800"
      >
        <svg
          className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {tabActivo === "ASISTENCIAL"
            ? "Las citas asistenciales se agendan desde KiwiPro. Los horarios configurados aquí no afectan la landing page."
            : "Las sesiones de descubrimiento se agendan desde la landing page (descubre.equilibraco.com). Los horarios aquí son los que aparecen disponibles para nuevos pacientes."}{" "}
          Las dos agendas comparten la misma línea de tiempo: si tienes una cita
          en un horario, ese slot queda bloqueado en ambas.
        </span>
      </div>

      {/* Panel del tipo activo — se monta/desmonta para forzar fetch */}
      {tabActivo === "ASISTENCIAL" ? (
        <TipoPanel key="asistencial" tipo="ASISTENCIAL" />
      ) : (
        <TipoPanel key="descubrimiento" tipo="DESCUBRIMIENTO" />
      )}
    </div>
  );
};

export default AgendaConfig;
