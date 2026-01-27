import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodInflammatoryViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodInflammatoryView: React.FC<PeriodInflammatoryViewProps> = ({ complianceData }) => {
  const inflammatory = complianceData.period_summary.analysis.inflammatory_summary
  const diiChartData = inflammatory.dii_chart_data ?? []
  const recommendations = inflammatory.recommendations ?? []

  const getClassificationColor = (classification: string) => {
    const lower = (classification || '').toLowerCase()
    if (lower.includes('anti')) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    if (lower.includes('pro')) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
  }

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análisis Inflamatorio del Período</h2>
        <div className="flex items-center mt-2 space-x-3">
          <span className={`text-lg font-bold px-4 py-1 rounded ${getClassificationColor(inflammatory.classification)}`}>
            {inflammatory.classification}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            DII Promedio: <span className="font-semibold text-orange-600 dark:text-orange-400">
              {inflammatory.average_dii.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Días Analizados</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{inflammatory.days_analyzed}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {inflammatory.days_with_complete_data} completos
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Anti-inflamatorios</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{inflammatory.anti_inflammatory_days}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((inflammatory.anti_inflammatory_days / inflammatory.days_analyzed) * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pro-inflamatorios</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inflammatory.pro_inflammatory_days}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((inflammatory.pro_inflammatory_days / inflammatory.days_analyzed) * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Neutrales</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{inflammatory.neutral_days}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((inflammatory.neutral_days / inflammatory.days_analyzed) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* DII Range */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Rango DII</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mínimo</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{inflammatory.min_dii.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Promedio</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{inflammatory.average_dii.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Máximo</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{inflammatory.max_dii.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">📈</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tendencia</h3>
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">{inflammatory.trend}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{inflammatory.trend_description}</p>
          </div>
        </div>
      </div>

      {/* DII Chart Data */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Evolución DII por Día</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">DII</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Clasificación</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {diiChartData.length > 0 ? (
                diiChartData.map((point, idx) => (
                  <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{point.date ?? '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-sm font-semibold ${
                        typeof point.dii === 'number' ? (point.dii < -1 ? 'text-green-600 dark:text-green-400' :
                        point.dii > 1 ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400') : 'text-gray-500'
                      }`}>
                        {typeof point.dii === 'number' ? point.dii.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${getClassificationColor(point.classification ?? '')}`}>
                        {point.classification ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {point.is_projected ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">Proyectado</span>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Completo</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">No hay datos</td>
                </tr>
              )}
            </tbody> 
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recomendaciones</h3>
            <ul className="space-y-2">
              {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              )) : (
                <li className="text-sm text-gray-600 dark:text-gray-400">No hay recomendaciones disponibles</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
