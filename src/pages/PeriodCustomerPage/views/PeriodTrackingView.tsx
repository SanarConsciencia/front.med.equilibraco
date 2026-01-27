import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodTrackingViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodTrackingView: React.FC<PeriodTrackingViewProps> = ({ complianceData }) => {
  const tracking = complianceData.period_summary.analysis.tracking_summary

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen de Seguimiento</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Consistencia promedio: <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {tracking.overall_consistency.average_consistency.toFixed(1)}%
          </span>
        </p>
      </div>

      {/* Sleep Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-2">😴</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sueño</h3>
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {tracking.sleep.consistency_percentage.toFixed(0)}% consistencia
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Promedio</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {tracking.sleep.average_hours?.toFixed(1) ?? 'N/A'}h
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Mínimo</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.sleep.min_minutes ? (tracking.sleep.min_minutes / 60).toFixed(1) + 'h' : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Máximo</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.sleep.max_minutes ? (tracking.sleep.max_minutes / 60).toFixed(1) + 'h' : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Días registrados</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.sleep.days_tracked}
            </p>
          </div>
        </div>
        {tracking.sleep.main_sleep_avg_hours && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium">Sueño principal:</span> {tracking.sleep.main_sleep_avg_hours.toFixed(1)}h | 
            <span className="font-medium ml-2">Siestas promedio:</span> {tracking.sleep.naps_avg_minutes?.toFixed(0) ?? 0} min
          </div>
        )}
        <p className="text-sm text-blue-700 dark:text-blue-300 italic">{tracking.sleep.recommendation}</p>
        {tracking.sleep.message && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{tracking.sleep.message}</p>
        )}
      </div>

      {/* Hydration Summary */}
      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-2">💧</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hidratación</h3>
          </div>
          <span className="text-xs bg-cyan-100 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200 px-2 py-1 rounded">
            {tracking.hydration.consistency_percentage.toFixed(0)}% consistencia
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Promedio</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {tracking.hydration.average_liters?.toFixed(1) ?? 'N/A'}L
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Mínimo</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.hydration.min_ml ? (tracking.hydration.min_ml / 1000).toFixed(1) + 'L' : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Máximo</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.hydration.max_ml ? (tracking.hydration.max_ml / 1000).toFixed(1) + 'L' : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Días registrados</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.hydration.days_tracked}
            </p>
          </div>
        </div>
        {tracking.hydration.meets_goal !== null && (
          <div className="mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              tracking.hydration.meets_goal 
                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
            }`}>
              {tracking.hydration.meets_goal ? '✓ Meta alcanzada' : '⚠ Meta no alcanzada'}
            </span>
          </div>
        )}
        <p className="text-sm text-cyan-700 dark:text-cyan-300 italic">{tracking.hydration.recommendation}</p>
      </div>

      {/* Physical Activity Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🏃</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Física</h3>
          </div>
          <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
            {tracking.physical_activity.consistency_percentage?.toFixed(0) ?? 0}% consistencia
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Promedio diario</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {tracking.physical_activity.average_minutes?.toFixed(0) ?? 0} min
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total período</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.physical_activity.total_minutes?.toFixed(0) ?? 0} min
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Días activos</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.physical_activity.days_with_activity ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Proyección semanal</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.physical_activity.weekly_projection?.toFixed(0) ?? 0} min
            </p>
          </div>
        </div>
        {tracking.physical_activity.meets_who_recommendation !== null && (
          <div className="mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              tracking.physical_activity.meets_who_recommendation 
                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
            }`}>
              {tracking.physical_activity.meets_who_recommendation ? '✓ Cumple OMS (150 min/semana)' : '⚠ No cumple OMS'}
            </span>
          </div>
        )}
        <p className="text-sm text-green-700 dark:text-green-300 italic">{tracking.physical_activity.recommendation}</p>
      </div>

      {/* Walking Summary */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🚶</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Caminata</h3>
          </div>
          <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
            {tracking.walking.consistency_percentage.toFixed(0)}% consistencia
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Promedio pasos</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {tracking.walking.average_steps?.toLocaleString() ?? 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total pasos</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.walking.total_steps?.toLocaleString() ?? 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Distancia promedio</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.walking.average_distance_km?.toFixed(1) ?? 'N/A'} km
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Días registrados</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {tracking.walking.days_tracked}
            </p>
          </div>
        </div>
        {tracking.walking.meets_goal !== null && (
          <div className="mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              tracking.walking.meets_goal 
                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
            }`}>
              {tracking.walking.meets_goal ? '✓ Meta alcanzada (10,000 pasos)' : '⚠ Meta no alcanzada'}
            </span>
          </div>
        )}
        <p className="text-sm text-purple-700 dark:text-purple-300 italic">{tracking.walking.recommendation}</p>
      </div>
    </div>
  )
}
