import React, { useState } from 'react'
import { Button } from '../ui'
import type { AgendaBloqueoCreate, TipoBloqueo } from '../../types/agendaTypes'

// Exportar la interfaz para que TypeScript la resuelva correctamente
export interface BloqueoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AgendaBloqueoCreate) => Promise<void>
}

function nowColombiaISO(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
    .format(new Date())
    .replace(' ', 'T')
    .substring(0, 16)
}

const BloqueoModal: React.FC<BloqueoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [tipo, setTipo] = useState<TipoBloqueo>('BLOQUEO')
  const [motivo, setMotivo] = useState('')
  const [fechaInicio, setFechaInicio] = useState(nowColombiaISO())
  const [fechaFin, setFechaFin] = useState(nowColombiaISO())
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const resetForm = () => {
    const now = nowColombiaISO()
    setTipo('BLOQUEO')
    setMotivo('')
    setFechaInicio(now)
    setFechaFin(now)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Completa las fechas')
      return
    }
    if (fechaFin <= fechaInicio) {
      setError('La fecha de fin debe ser posterior a la de inicio')
      return
    }
    setError(null)
    setGuardando(true)
    try {
      await onSubmit({
        tipo,
        motivo: motivo.trim() || undefined,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el bloqueo')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nuevo bloqueo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Bloquea un rango de tiempo en tu agenda
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de bloqueo
            </label>
            <div className="flex gap-2">
              {(['BLOQUEO', 'VACACIONES'] as TipoBloqueo[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all
                    ${tipo === t
                      ? 'bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
                    }
                  `}
                >
                  {t === 'BLOQUEO' ? '🚫 Bloqueo' : '🏖️ Vacaciones'}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motivo <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Reunión, capacitación, descanso…"
              maxLength={120}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Inicio
              </label>
              <input
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fin
              </label>
              <input
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Todas las fechas son en hora Colombia (UTC–5)
          </p>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleClose} disabled={guardando} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={guardando} className="flex-1">
            {guardando ? 'Guardando…' : 'Crear bloqueo'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BloqueoModal