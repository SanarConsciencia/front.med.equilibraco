import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodNutrientVarietyViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodNutrientVarietyView: React.FC<PeriodNutrientVarietyViewProps> = ({ complianceData }) => {
  const variety = complianceData.period_summary.analysis.nutrient_variety

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Variedad de Nutrientes</h2>
        <div className="flex items-center mt-2 space-x-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Puntuación: </span>
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {variety.variety_score.toFixed(1)}/100
            </span>
          </div>
          <div>
            <span className={`text-xs font-semibold px-3 py-1 rounded ${
              variety.meets_weekly_goal 
                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
            }`}>
              {variety.meets_weekly_goal ? '✓ Meta semanal alcanzada' : '⚠ Meta semanal no alcanzada'}
            </span>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🥗</span>
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{variety.unique_foods_count}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Alimentos únicos</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🌾</span>
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">Prebióticos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{variety.prebiotic_foods_count}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Alimentos prebióticos</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎯</span>
            <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Meta</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{variety.weekly_goal}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Objetivo semanal</p>
        </div>
      </div>

      {/* Category Distribution */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Distribución por Categoría</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="space-y-2">
            {Object.entries(variety.category_distribution)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full transition-all"
                        style={{ width: `${(count / variety.unique_foods_count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top 10 Most Consumed */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Top 10 Más Consumidos</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Alimento</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">Veces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {variety.top_10_most_consumed.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.food}</td>
                  <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900 dark:text-white">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prebiotic Foods */}
      {variety.prebiotic_foods.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Alimentos Prebióticos Consumidos ({variety.prebiotic_foods_count})
          </h3>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {variety.prebiotic_foods.map((food, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-3 py-1 rounded-full"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Recomendación</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">{variety.recommendation}</p>
            {variety.message && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{variety.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
