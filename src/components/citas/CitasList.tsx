import React, { useEffect, useState } from 'react'
import { useCitasStore } from '../../stores/citasStore'
import { useAppStore } from '../../stores/appStore'
import CitaCard from './CitaCard'
import CitaDetailModal from './CitaDetailModal'
import type { CitaResponse, EstadoCita } from '../../types/agendaTypes'
import { ESTADO_CITA_LABEL } from '../../types/agendaTypes'

const ESTADOS_FILTRO: Array<{ valor: EstadoCita | ''; label: string }> = [
  { valor: '', label: 'Todas' },
  { valor: 'PENDIENTE',  label: ESTADO_CITA_LABEL.PENDIENTE },
  { valor: 'CONFIRMADA', label: ESTADO_CITA_LABEL.CONFIRMADA },
  { valor: 'COMPLETADA', label: ESTADO_CITA_LABEL.COMPLETADA },
  { valor: 'CANCELADA',  label: ESTADO_CITA_LABEL.CANCELADA },
  { valor: 'NO_SHOW',    label: ESTADO_CITA_LABEL.NO_SHOW },
]

const CitasList: React.FC = () => {
  const { token } = useAppStore()
  const {
    citas,
    loading,
    error,
    filtros,
    fetchCitas,
    setCitaActiva,
    citaActiva,
    setFiltros,
    getCitasPendientesCount,
  } = useCitasStore()

  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (token) fetchCitas(token)
  }, [token, fetchCitas])

  const pendientesCount = getCitasPendientesCount()

  // Filtro local por nombre / email / teléfono
  const citasFiltradas = citas.filter((c) => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      c.customer_nombre.toLowerCase().includes(q) ||
      c.customer_email?.toLowerCase().includes(q) ||
      c.customer_phone?.includes(q)
    )
  })

  const handleFiltroFecha = (campo: 'desde' | 'hasta', valor: string) => {
    const nuevosFiltros = { ...filtros, [campo]: valor }
    if (token) {
      setFiltros(nuevosFiltros)
      fetchCitas(token, nuevosFiltros)
    }
  }

  const handleFiltroEstado = (estado: EstadoCita | '') => {
    const nuevosFiltros = { ...filtros, estado }
    if (token) {
      setFiltros(nuevosFiltros)
      fetchCitas(token, nuevosFiltros)
    }
  }

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Citas</h3>
          {pendientesCount > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
              {pendientesCount} pendiente{pendientesCount !== 1 ? 's' : ''} de atención
            </p>
          )}
        </div>
      </div>

      {/* Filtros fecha */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Desde</label>
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => handleFiltroFecha('desde', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => handleFiltroFecha('hasta', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtro estado */}
      <div className="flex gap-2 flex-wrap">
        {ESTADOS_FILTRO.map(({ valor, label }) => (
          <button
            key={valor}
            type="button"
            onClick={() => handleFiltroEstado(valor)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${filtros.estado === valor
                ? 'bg-green-600 dark:bg-green-500 text-white border-green-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-green-400'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Búsqueda local */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-500" />
        </div>
      ) : citasFiltradas.length > 0 ? (
        <div className="space-y-2">
          {citasFiltradas.map((cita) => (
            <CitaCard
              key={cita.id}
              cita={cita}
              onClick={(c: CitaResponse) => setCitaActiva(c)}
            />
          ))}
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
            {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? 's' : ''}
          </p>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <span className="text-3xl">📋</span>
          <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Sin citas para este período
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Ajusta los filtros o el rango de fechas
          </p>
        </div>
      )}

      <CitaDetailModal cita={citaActiva} onClose={() => setCitaActiva(null)} />
    </div>
  )
}

export default CitasList