import React from 'react'
import type { CitaResponse } from '../../types/agendaTypes'
import {
  ESTADO_CITA_LABEL,
  ESTADO_CITA_COLOR,
  formatHora,
  formatFechaCorta,
} from '../../types/agendaTypes'

interface Props {
  cita: CitaResponse
  onClick: (cita: CitaResponse) => void
  compact?: boolean
}

const CitaCard: React.FC<Props> = ({ cita, onClick, compact = false }) => {
  const label = ESTADO_CITA_LABEL[cita.estado]
  const color = ESTADO_CITA_COLOR[cita.estado]

  const horaInicio = formatHora(cita.fecha_hora_inicio_colombia)
  const horaFin    = formatHora(cita.fecha_hora_fin_colombia)
  const fecha      = formatFechaCorta(cita.fecha_hora_inicio_colombia)

  return (
    <button
      type="button"
      onClick={() => onClick(cita)}
      className={`
        w-full text-left rounded-xl border transition-all
        hover:shadow-md hover:-translate-y-0.5 active:translate-y-0
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {cita.customer_nombre}
          </p>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {!compact && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{fecha}</span>
            )}
            <span className={`text-xs font-medium text-gray-700 dark:text-gray-300 ${!compact ? 'border-l border-gray-300 dark:border-gray-600 pl-2' : ''}`}>
              {horaInicio} – {horaFin}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {cita.duracion_minutos} min
            </span>
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mt-1.5">
              {cita.customer_email && (
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">
                  {cita.customer_email}
                </span>
              )}
              {cita.customer_phone && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {cita.customer_phone}
                </span>
              )}
            </div>
          )}

          {cita.notas_paciente && !compact && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-1 italic">
              "{cita.notas_paciente}"
            </p>
          )}
        </div>

        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
          {label}
        </span>
      </div>

      {cita.cita_original_id && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reagendada
        </div>
      )}
    </button>
  )
}

export default CitaCard