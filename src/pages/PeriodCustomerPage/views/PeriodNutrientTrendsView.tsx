import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodNutrientTrendsViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodNutrientTrendsView: React.FC<PeriodNutrientTrendsViewProps> = ({ complianceData }) => {
  const trends = complianceData.period_summary.analysis.nutrient_trends
  const nutrients = trends.nutrients ?? []
  const summary = trends.summary ?? ''

  const getStatusColor = (status: string) => {
    const lower = (status || '').toLowerCase()
    if (lower.includes('bajo') || lower.includes('deficiente')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
    }
    if (lower.includes('alto') || lower.includes('exceso')) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700'
    }
    if (lower.includes('óptimo') || lower.includes('adecuado')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
  }

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tendencias de Nutrientes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{summary}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <span className="text-3xl mb-2 block">⚠️</span>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{trends.low_compliance_count ?? 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nutrientes con compliance bajo</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{trends.high_compliance_count ?? 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nutrientes con compliance alto</p>
        </div>
      </div>

      {/* Nutrients List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Análisis por Nutriente</h3>
        {nutrients.length > 0 ? nutrients.map((nutrient, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getStatusColor(nutrient.status ?? '')}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-base mb-1">
                  {typeof nutrient.average_compliance === 'number' && nutrient.average_compliance >= 0 ? '✓' : '✗'} Nutriente #{idx + 1}
                </h4>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  (nutrient.status ?? '').toLowerCase().includes('bajo') ? 'bg-red-200 dark:bg-red-800' :
                  (nutrient.status ?? '').toLowerCase().includes('alto') ? 'bg-orange-200 dark:bg-orange-800' :
                  'bg-green-200 dark:bg-green-800'
                }`}>
                  {nutrient.status ?? '—'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{typeof nutrient.average_compliance === 'number' ? `${nutrient.average_compliance.toFixed(1)}%` : 'N/A'}</p>
                <p className="text-xs opacity-75">Promedio</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs opacity-75 mb-1">Mínimo</p>
                <p className="text-sm font-semibold">{typeof nutrient.min_compliance === 'number' ? `${nutrient.min_compliance.toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs opacity-75 mb-1">Q1</p>
                <p className="text-sm font-semibold">{typeof nutrient.q1 === 'number' ? `${nutrient.q1.toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs opacity-75 mb-1">Mediana</p>
                <p className="text-sm font-semibold">{typeof nutrient.median === 'number' ? `${nutrient.median.toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs opacity-75 mb-1">Q3</p>
                <p className="text-sm font-semibold">{typeof nutrient.q3 === 'number' ? `${nutrient.q3.toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs opacity-75 mb-1">Máximo</p>
                <p className="text-sm font-semibold">{typeof nutrient.max_compliance === 'number' ? `${nutrient.max_compliance.toFixed(1)}%` : 'N/A'}</p>
              </div>
            </div>

            {/* Issues */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs opacity-75 mb-1">Días &lt; 70%</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">{typeof nutrient.days_below_70 === 'number' ? nutrient.days_below_70 : 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs opacity-75 mb-1">Días &gt; 120%</p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{typeof nutrient.days_above_120 === 'number' ? nutrient.days_above_120 : 'N/A'}</p>
              </div>
            </div>

            {/* Top Food Sources */}
            {(nutrient.top_food_sources ?? []).length > 0 ? (
              <div className="mb-3">
                <p className="text-xs font-semibold mb-2 opacity-75">Principales Fuentes:</p>
                <div className="flex flex-wrap gap-2">
                  {(nutrient.top_food_sources ?? []).slice(0, 5).map((source, sidx) => (
                    <span
                      key={sidx}
                      className="text-xs bg-white/70 dark:bg-black/30 px-2 py-1 rounded"
                    >
                      {source.food_name} ({typeof source.contribution === 'number' ? source.contribution.toFixed(0) : 'N/A'}%)
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Recommendation */}
            <div className="bg-white/50 dark:bg-black/20 rounded p-3">
              <p className="text-xs font-medium flex items-start">
                <span className="mr-1">💡</span>
                <span>{nutrient.recommendation ?? '—'}</span>
              </p>
            </div>
          </div>
        )) : (
          <div className="text-sm text-gray-600 dark:text-gray-400 p-4">No hay datos de nutrientes</div>
        )}
      </div>
    </div>
  )
}
