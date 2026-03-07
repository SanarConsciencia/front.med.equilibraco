import React, { useEffect, useState } from 'react'
import { useCitasStore } from '../../stores/citasStore'
import { useAppStore } from '../../stores/appStore'
import CitaDetailModal from './CitaDetailModal'
import type { CitaResponse } from '../../types/agendaTypes'
import { ESTADO_CITA_COLOR, formatHora, todayColombia } from '../../types/agendaTypes'

// ── Helpers de semana ─────────────────────────────────────────────────────────

function inicioSemana(fecha: Date): Date {
  const d = new Date(fecha)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(fecha: Date, n: number): Date {
  const d = new Date(fecha)
  d.setDate(d.getDate() + n)
  return d
}

function toColombiaDateStr(fecha: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(fecha)
}

function labelDia(fecha: Date): { letra: string; numero: number } {
  const letra = new Intl.DateTimeFormat('es-CO', { weekday: 'short', timeZone: 'America/Bogota' })
    .format(fecha)
    .slice(0, 2)
    .toUpperCase()
  const numero = Number(
    new Intl.DateTimeFormat('en-CA', { day: 'numeric', timeZone: 'America/Bogota' }).format(fecha),
  )
  return { letra, numero }
}

function labelMesAno(lunes: Date): string {
  const dom = addDays(lunes, 6)
  const mesLunes = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'America/Bogota' }).format(lunes)
  const mesDom   = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'America/Bogota' }).format(dom)
  const ano      = new Intl.DateTimeFormat('es-CO', { year: 'numeric', timeZone: 'America/Bogota' }).format(dom)
  if (mesLunes === mesDom) {
    return `${mesLunes.charAt(0).toUpperCase() + mesLunes.slice(1)} ${ano}`
  }
  return `${mesLunes.charAt(0).toUpperCase() + mesLunes.slice(1)} – ${mesDom} ${ano}`
}

function agruparPorFecha(citas: CitaResponse[]): Map<string, CitaResponse[]> {
  const mapa = new Map<string, CitaResponse[]>()
  for (const cita of citas) {
    const fecha = cita.fecha_hora_inicio_colombia.slice(0, 10)
    const lista = mapa.get(fecha) ?? []
    lista.push(cita)
    mapa.set(fecha, lista)
  }
  return mapa
}

// ── Pill de cita ──────────────────────────────────────────────────────────────

const CitaPill: React.FC<{
  cita: CitaResponse
  onClick: (c: CitaResponse) => void
}> = ({ cita, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(cita)}
    title={`${cita.customer_nombre} — ${formatHora(cita.fecha_hora_inicio_colombia)}`}
    className={`
      w-full text-left px-2 py-1 rounded-md text-xs font-medium truncate
      transition-all hover:opacity-80 active:scale-95
      ${ESTADO_CITA_COLOR[cita.estado]}
    `}
  >
    <span className="font-semibold">{formatHora(cita.fecha_hora_inicio_colombia)}</span>
    <span className="ml-1 opacity-80">{cita.customer_nombre.split(' ')[0]}</span>
  </button>
)

// ── Componente principal ──────────────────────────────────────────────────────

const CitasCalendario: React.FC = () => {
  const { token } = useAppStore()
  const { citas, loading, fetchCitas, citaActiva, setCitaActiva } = useCitasStore()

  const [lunesActual, setLunesActual] = useState<Date>(() => inicioSemana(new Date()))
  const hoyStr = todayColombia()

  useEffect(() => {
    if (!token) return
    const desde = toColombiaDateStr(lunesActual)
    const hasta = toColombiaDateStr(addDays(lunesActual, 6))
    fetchCitas(token, { desde, hasta, estado: '' })
  }, [token, lunesActual, fetchCitas])

  const citasPorFecha = agruparPorFecha(citas)

  const dias = Array.from({ length: 7 }, (_, i) => {
    const fecha    = addDays(lunesActual, i)
    const fechaStr = toColombiaDateStr(fecha)
    return {
      fecha,
      fechaStr,
      ...labelDia(fecha),
      esHoy: fechaStr === hoyStr,
      citas: (citasPorFecha.get(fechaStr) ?? []).sort((a, b) =>
        a.fecha_hora_inicio_colombia.localeCompare(b.fecha_hora_inicio_colombia),
      ),
    }
  })

  const totalSemana = dias.reduce((acc, d) => acc + d.citas.length, 0)

  return (
    <div className="space-y-4">
      {/* Navegación */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {labelMesAno(lunesActual)}
          </h3>
          {!loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalSemana} cita{totalSemana !== 1 ? 's' : ''} esta semana
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLunesActual((p) => addDays(p, -7))}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label="Semana anterior"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setLunesActual(inicioSemana(new Date()))}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600"
          >
            Hoy
          </button>

          <button
            onClick={() => setLunesActual((p) => addDays(p, 7))}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label="Semana siguiente"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cuadrícula */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-500" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {dias.map((dia) => (
            <div key={dia.fechaStr} className="flex flex-col min-h-[120px]">
              <div className={`
                flex flex-col items-center py-2 rounded-t-xl mb-1
                ${dia.esHoy
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                }
              `}>
                <span className="text-xs font-medium">{dia.letra}</span>
                <span className={`text-lg font-bold leading-none mt-0.5 ${dia.esHoy ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {dia.numero}
                </span>
              </div>

              <div className={`
                flex-1 rounded-b-xl p-1.5 space-y-1 min-h-[80px]
                ${dia.citas.length > 0
                  ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                  : ''
                }
              `}>
                {dia.citas.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                  </div>
                ) : (
                  <>
                    {dia.citas.slice(0, 3).map((cita) => (
                      <CitaPill key={cita.id} cita={cita} onClick={setCitaActiva} />
                    ))}
                    {dia.citas.length > 3 && (
                      <p className="text-xs text-center text-gray-400 dark:text-gray-500 font-medium pt-0.5">
                        +{dia.citas.length - 3} más
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 pt-1">
        {(
          [
            ['PENDIENTE',  'Pendiente'],
            ['CONFIRMADA', 'Confirmada'],
            ['COMPLETADA', 'Completada'],
            ['CANCELADA',  'Cancelada'],
            ['NO_SHOW',    'No asistió'],
          ] as const
        ).map(([estado, label]) => (
          <div key={estado} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${ESTADO_CITA_COLOR[estado].split(' ')[0]}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <CitaDetailModal cita={citaActiva} onClose={() => setCitaActiva(null)} />
    </div>
  )
}

export default CitasCalendario