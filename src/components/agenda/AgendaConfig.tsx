import React, { useEffect, useState } from 'react'
import { useAgendaStore } from '../../stores/agendaStore'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui'
import type { DiaAgendaForm } from '../../types/agendaTypes'
import { DURACIONES_OPCIONES } from '../../types/agendaTypes'

// ── Helpers ───────────────────────────────────────────────────────────────────

function validarHoras(inicio: string, fin: string): string | null {
  if (!inicio || !fin) return 'Completa los horarios'
  const [hi, mi] = inicio.split(':').map(Number)
  const [hf, mf] = fin.split(':').map(Number)
  if (hi * 60 + mi >= hf * 60 + mf) return 'La hora de fin debe ser mayor a la de inicio'
  return null
}

// ── Subcomponente: chip de duración ───────────────────────────────────────────

const DuracionChip: React.FC<{
  minutos: number
  seleccionado: boolean
  onClick: () => void
  disabled: boolean
}> = ({ minutos, seleccionado, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`
      px-3 py-1 rounded-full text-sm font-medium border transition-all
      ${seleccionado
        ? 'bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500'
        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400'
      }
      disabled:opacity-40 disabled:cursor-not-allowed
    `}
  >
    {minutos} min
  </button>
)

// ── Subcomponente: fila de un día ─────────────────────────────────────────────

const DiaRow: React.FC<{
  dia: DiaAgendaForm
  onToggleActive: () => void
  onEdit: () => void
  onSave: (horaInicio: string, horaFin: string, duraciones: number[]) => Promise<void>
  onCancel: () => void
}> = ({ dia, onToggleActive, onEdit, onSave, onCancel }) => {
  const [horaInicio, setHoraInicio] = useState(dia.hora_inicio)
  const [horaFin, setHoraFin] = useState(dia.hora_fin)
  const [duraciones, setDuraciones] = useState<number[]>(dia.duraciones_minutos)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sincronizar si cambian los props (p.ej. después de guardar)
  useEffect(() => {
    setHoraInicio(dia.hora_inicio)
    setHoraFin(dia.hora_fin)
    setDuraciones(dia.duraciones_minutos)
    setError(null)
  }, [dia.hora_inicio, dia.hora_fin, dia.duraciones_minutos, dia.editando])

  const toggleDuracion = (min: number) => {
    setDuraciones((prev) =>
      prev.includes(min) ? prev.filter((d) => d !== min) : [...prev, min].sort((a, b) => a - b),
    )
  }

  const handleSave = async () => {
    const err = validarHoras(horaInicio, horaFin)
    if (err) { setError(err); return }
    if (duraciones.length === 0) { setError('Selecciona al menos una duración'); return }

    setError(null)
    setGuardando(true)
    try {
      await onSave(horaInicio, horaFin, duraciones)
    } catch {
      // el error ya lo maneja el store
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={`
      rounded-xl border transition-all
      ${dia.is_active
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }
    `}>
      {/* Cabecera del día */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Toggle activo/inactivo */}
          <button
            type="button"
            onClick={onToggleActive}
            className={`
              relative w-11 h-6 rounded-full transition-colors focus:outline-none
              ${dia.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
            `}
            aria-label={`${dia.is_active ? 'Desactivar' : 'Activar'} ${dia.dia_nombre}`}
          >
            <span className={`
              absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
              ${dia.is_active ? 'translate-x-5' : 'translate-x-0'}
            `} />
          </button>

          <span className={`font-semibold text-sm w-24
            ${dia.is_active
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
            }
          `}>
            {dia.dia_nombre}
          </span>

          {/* Resumen cuando no está editando */}
          {!dia.editando && dia.is_active && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dia.hora_inicio} – {dia.hora_fin}
              <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
              {dia.duraciones_minutos.map((d) => `${d} min`).join(', ')}
            </span>
          )}

          {!dia.editando && !dia.is_active && (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">No disponible</span>
          )}
        </div>

        {/* Botón editar */}
        {dia.is_active && !dia.editando && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
          >
            Editar
          </button>
        )}
      </div>

      {/* Panel de edición */}
      {dia.editando && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
          {/* Horas */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Hora inicio
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Hora fin
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duraciones */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Duraciones disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {DURACIONES_OPCIONES.map((min) => (
                <DuracionChip
                  key={min}
                  minutos={min}
                  seleccionado={duraciones.includes(min)}
                  onClick={() => toggleDuracion(min)}
                  disabled={guardando}
                />
              ))}
            </div>
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
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel} disabled={guardando}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

const AgendaConfig: React.FC = () => {
  const { token } = useAppStore()
  const {
    fetchConfigs,
    upsertConfig,
    desactivarDia,
    loadingConfigs,
    errorConfigs,
    getFormDias,
  } = useAgendaStore()

  // Estado local de edición (qué días están en modo editar)
  const [diasEditando, setDiasEditando] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (token) fetchConfigs(token)
  }, [token, fetchConfigs])

  const dias = getFormDias()

  const handleToggleActive = async (diaSemana: number, isActive: boolean) => {
    if (!token) return
    const dia = dias.find((d) => d.dia_semana === diaSemana)
    if (!dia) return

    if (isActive) {
      // Desactivar
      try {
        await desactivarDia(token, diaSemana)
        setDiasEditando((prev) => { const s = new Set(prev); s.delete(diaSemana); return s })
      } catch { /* el store ya maneja el error */ }
    } else {
      // Activar: guardar con los valores actuales del formulario
      try {
        await upsertConfig(token, {
          dia_semana: diaSemana,
          hora_inicio: dia.hora_inicio,
          hora_fin: dia.hora_fin,
          duraciones_minutos: dia.duraciones_minutos,
          is_active: true,
        })
      } catch { /* el store ya maneja el error */ }
    }
  }

  const handleSave = async (
    diaSemana: number,
    horaInicio: string,
    horaFin: string,
    duraciones: number[],
  ) => {
    if (!token) return
    await upsertConfig(token, {
      dia_semana: diaSemana,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      duraciones_minutos: duraciones,
      is_active: true,
    })
    setDiasEditando((prev) => { const s = new Set(prev); s.delete(diaSemana); return s })
  }

  if (loadingConfigs) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Horario semanal
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Activa los días que atiendes y configura los horarios
          </p>
        </div>
      </div>

      {errorConfigs && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {errorConfigs}
        </div>
      )}

      {dias.map((dia) => (
        <DiaRow
          key={dia.dia_semana}
          dia={{
            ...dia,
            editando: diasEditando.has(dia.dia_semana),
          }}
          onToggleActive={() => handleToggleActive(dia.dia_semana, dia.is_active)}
          onEdit={() =>
            setDiasEditando((prev) => new Set(prev).add(dia.dia_semana))
          }
          onSave={(horaInicio, horaFin, duraciones) =>
            handleSave(dia.dia_semana, horaInicio, horaFin, duraciones)
          }
          onCancel={() =>
            setDiasEditando((prev) => {
              const s = new Set(prev)
              s.delete(dia.dia_semana)
              return s
            })
          }
        />
      ))}
    </div>
  )
}

export default AgendaConfig