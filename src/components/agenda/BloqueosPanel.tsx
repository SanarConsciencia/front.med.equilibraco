import React, { useEffect, useState } from 'react'
import { useAgendaStore } from '../../stores/agendaStore'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui'
import BloqueoModal from './BloqueoModal'
import type { AgendaBloqueoCreate, AgendaBloqueoResponse } from '../../types/agendaTypes'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRangoBloqueo(inicio: string, fin: string): string {
  const opciones: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Bogota',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }
  const fmt = new Intl.DateTimeFormat('es-CO', opciones)
  return `${fmt.format(new Date(inicio))} → ${fmt.format(new Date(fin))}`
}

function esFuturo(fechaISO: string): boolean {
  return new Date(fechaISO) > new Date()
}

// ── Subcomponente: tarjeta de bloqueo ─────────────────────────────────────────

const BloqueoCard: React.FC<{
  bloqueo: AgendaBloqueoResponse
  onEliminar: (id: number) => void
  eliminando: boolean
}> = ({ bloqueo, onEliminar, eliminando }) => {
  const futuro = esFuturo(bloqueo.fecha_fin_colombia)

  return (
    <div className={`
      flex items-start justify-between p-4 rounded-xl border transition-all
      ${futuro
        ? 'border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/10'
        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
      }
    `}>
      <div className="flex items-start gap-3 min-w-0">
        {/* Ícono tipo */}
        <span className="text-xl shrink-0 mt-0.5">
          {bloqueo.tipo === 'VACACIONES' ? '🏖️' : '🚫'}
        </span>

        <div className="min-w-0">
          {/* Tipo + motivo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`
              text-xs font-semibold px-2 py-0.5 rounded-full
              ${bloqueo.tipo === 'VACACIONES'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }
            `}>
              {bloqueo.tipo === 'VACACIONES' ? 'Vacaciones' : 'Bloqueo'}
            </span>
            {!futuro && (
              <span className="text-xs text-gray-400 dark:text-gray-500">Pasado</span>
            )}
          </div>

          {bloqueo.motivo && (
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
              {bloqueo.motivo}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatRangoBloqueo(bloqueo.fecha_inicio_colombia, bloqueo.fecha_fin_colombia)}
          </p>
        </div>
      </div>

      {/* Eliminar */}
      {futuro && (
        <button
          onClick={() => onEliminar(bloqueo.id)}
          disabled={eliminando}
          className="ml-3 shrink-0 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label="Eliminar bloqueo"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

const BloqueosPanel: React.FC<Record<string, never>> = () => {
  const { token } = useAppStore()
  const {
    bloqueos,
    loadingBloqueos,
    errorBloqueos,
    fetchBloqueos,
    crearBloqueo,
    eliminarBloqueo,
  } = useAgendaStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  useEffect(() => {
    if (token) fetchBloqueos(token)
  }, [token, fetchBloqueos])

  const handleCrear = async (data: AgendaBloqueoCreate) => {
    if (!token) return
    await crearBloqueo(token, data)
  }

  const handleEliminar = async (id: number) => {
    if (!token) return
    const confirmado = window.confirm('¿Eliminar este bloqueo?')
    if (!confirmado) return

    setEliminandoId(id)
    try {
      await eliminarBloqueo(token, id)
    } finally {
      setEliminandoId(null)
    }
  }

  // Separar futuros de pasados
  const futuros = bloqueos.filter((b) => esFuturo(b.fecha_fin_colombia))
  const pasados = bloqueos.filter((b) => !esFuturo(b.fecha_fin_colombia))

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Bloqueos de agenda
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Bloquea fechas u horas específicas
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo bloqueo
        </Button>
      </div>

      {/* Error */}
      {errorBloqueos && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {errorBloqueos}
        </div>
      )}

      {/* Loading */}
      {loadingBloqueos ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-500" />
        </div>
      ) : (
        <>
          {/* Bloqueos futuros */}
          {futuros.length > 0 ? (
            <div className="space-y-2">
              {futuros.map((b) => (
                <BloqueoCard
                  key={b.id}
                  bloqueo={b}
                  onEliminar={handleEliminar}
                  eliminando={eliminandoId === b.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <span className="text-3xl">📅</span>
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Sin bloqueos próximos
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Tu agenda está completamente disponible
              </p>
            </div>
          )}

          {/* Bloqueos pasados (colapsados) */}
          {pasados.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 list-none flex items-center gap-1 select-none">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Ver {pasados.length} bloqueo{pasados.length !== 1 ? 's' : ''} pasado{pasados.length !== 1 ? 's' : ''}
              </summary>
              <div className="mt-2 space-y-2">
                {pasados.map((b) => (
                  <BloqueoCard
                    key={b.id}
                    bloqueo={b}
                    onEliminar={handleEliminar}
                    eliminando={eliminandoId === b.id}
                  />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {/* Modal */}
      <BloqueoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCrear}
      />
    </div>
  )
}

export default BloqueosPanel