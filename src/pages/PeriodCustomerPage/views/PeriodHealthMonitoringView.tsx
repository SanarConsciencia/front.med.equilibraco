import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodHealthMonitoringViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodHealthMonitoringView: React.FC<PeriodHealthMonitoringViewProps> = ({ complianceData }) => {
  const health = complianceData.period_summary.analysis.health_monitoring
  const symptoms = health.symptoms ?? {} as any
  const bowel = health.bowel_movements ?? {} as any

  const symptomsConsistency = typeof symptoms.consistency_percentage === 'number' ? symptoms.consistency_percentage : null
  const symptomsAvgPerDay = typeof symptoms.avg_per_day === 'number' ? symptoms.avg_per_day : null

  const bowelConsistency = typeof bowel.consistency_percentage === 'number' ? bowel.consistency_percentage : null
  const bowelAvgPerDay = typeof bowel.avg_per_day === 'number' ? bowel.avg_per_day : null
  const bowelAvgBristol = typeof bowel.avg_bristol_scale === 'number' ? bowel.avg_bristol_scale : null
  const bristolDistribution = bowel.bristol_distribution ?? {} as Record<string, number>

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monitoreo de Salud</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Seguimiento de síntomas y movimientos intestinales
        </p>
      </div>

      {/* Symptoms Summary */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-3xl mr-3">🤒</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Síntomas</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Estado: <span className={`font-semibold ${
                  (symptoms.tracking_status?.toLowerCase().includes('bien') || symptoms.tracking_status?.toLowerCase().includes('good'))
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {symptoms.tracking_status ?? '—'}
                </span>
              </p>
            </div>
          </div>
          {typeof symptomsConsistency === 'number' && (
            <span className="text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded">
              {symptomsConsistency.toFixed(0)}% días con registro
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-red-900/30 rounded p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Síntomas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{symptoms.total_count ?? 0}</p>
          </div>
          {typeof symptoms.days_with_symptoms === 'number' && (
            <div className="bg-white dark:bg-red-900/30 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Días con síntomas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{symptoms.days_with_symptoms}</p>
            </div>
          )}
          {typeof symptomsAvgPerDay === 'number' && (
            <div className="bg-white dark:bg-red-900/30 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Promedio/día</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{symptomsAvgPerDay.toFixed(1)}</p>
            </div>
          )}
          {typeof symptomsConsistency === 'number' && (
            <div className="bg-white dark:bg-red-900/30 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Consistencia</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{symptomsConsistency.toFixed(0)}%</p>
            </div>
          )}

        {/* Most Common Symptoms */}
        {(symptoms.most_common ?? []).length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Síntomas Más Comunes:</p>
            <div className="flex flex-wrap gap-2">
              {(symptoms.most_common ?? []).map((symptom, idx) => (
                <span
                  key={idx}
                  className="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded-full"
                >
                  {symptom.name} ({symptom.count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="bg-red-100 dark:bg-red-900/40 rounded p-3">
          <p className="text-sm text-red-700 dark:text-red-300 flex items-start">
            <span className="mr-2">💡</span>
            <span className="flex-1">{symptoms.recommendation ?? ''}</span>
          </p>
          {symptoms.message && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-6">{symptoms.message}</p>
          )}
        </div>
      </div>

      {/* Bowel Movements Summary */}
      <div className="bg-brown-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-3xl mr-3">💩</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Movimientos Intestinales</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Estado: <span className={`font-semibold ${
                  (bowel.tracking_status?.toLowerCase().includes('bien') || bowel.tracking_status?.toLowerCase().includes('good'))
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {bowel.tracking_status ?? '—'}
                </span>
              </p>
            </div>
          </div>
          {typeof bowelConsistency === 'number' && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded">
              {bowelConsistency.toFixed(0)}% días con registro
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-yellow-900/30 rounded p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{bowel.total_count ?? 0}</p>
          </div>
          {typeof bowel.days_tracked === 'number' && (
            <div className="bg-white dark:bg-yellow-900/30 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Días registrados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{bowel.days_tracked}</p>
            </div>
          )}
          {typeof bowelAvgPerDay === 'number' && (
            <div className="bg-white dark:bg-yellow-900/30 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Promedio/día</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{bowelAvgPerDay.toFixed(1)}</p>
            </div>
          )}
          {typeof bowelAvgBristol === 'number' && (
            <div className="bg-white dark:bg-yellow-900/30 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Bristol promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{bowelAvgBristol.toFixed(1)}</p>
            </div>
          )}
        </div>

        {/* Bristol Scale Distribution */}
        {Object.keys(bristolDistribution).length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">Distribución Escala Bristol:</p>
            <div className="space-y-2">
              {Object.entries(bristolDistribution)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([type, count]) => {
                  const values = Object.values(bristolDistribution).map(v => typeof v === 'number' ? v : 0)
                  const total = values.reduce((a, b) => a + b, 0) || 0
                  const percentage = total > 0 ? (count / total) * 100 : 0
                  const isPredominant = bowel.predominant_type === Number(type)
                  
                  return (
                    <div key={type} className="flex items-center">
                      <span className={`text-xs w-20 ${isPredominant ? 'font-bold text-yellow-700 dark:text-yellow-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        Tipo {type}
                        {isPredominant && ' 👑'}
                      </span>
                      <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            Number(type) >= 3 && Number(type) <= 4
                              ? 'bg-green-500'
                              : Number(type) === 2 || Number(type) === 5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white w-12 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  )
                })}
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded p-2">
              <p className="mb-1"><strong>Referencia:</strong></p>
              <p>• Tipos 3-4: 🟢 Ideal (normal)</p>
              <p>• Tipos 1-2: 🟡 Estreñimiento</p>
              <p>• Tipos 5-7: 🟡 Diarrea</p>
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start">
            <span className="mr-2">💡</span>
            <span className="flex-1">{bowel.recommendation ?? ''}</span>
          </p>
          {bowel.message && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-6">{bowel.message}</p>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
