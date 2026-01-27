import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodMealAnalysisViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodMealAnalysisView: React.FC<PeriodMealAnalysisViewProps> = ({ complianceData }) => {
  const mealAnalysis = complianceData.period_summary.analysis.meal_analysis
  const avgBalance = typeof mealAnalysis.avg_balance_score === 'number' ? mealAnalysis.avg_balance_score : null
  const bioactivesPct = typeof mealAnalysis.bioactives_percentage === 'number' ? mealAnalysis.bioactives_percentage : null
  const topMeals = mealAnalysis.top_meals ?? []
  const recommendation = mealAnalysis.recommendation ?? ''
  const message = mealAnalysis.message ?? ''

  const getBalanceColor = (classification: string) => {
    const lower = (classification || '').toLowerCase()
    if (lower.includes('equilibrad') || lower.includes('óptim')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    }
    if (lower.includes('desbalance') || lower.includes('desequilibr')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  }

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análisis de Comidas</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {(mealAnalysis.unique_meals_count ?? 0)} comidas únicas • {(mealAnalysis.total_meal_instances ?? 0)} instancias totales
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">⚖️</span>
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Balance</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgBalance !== null ? avgBalance.toFixed(1) : 'N/A'}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Score promedio de balance</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🌱</span>
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">Bioactivos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{bioactivesPct !== null ? `${bioactivesPct.toFixed(1)}%` : 'N/A'}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">De las comidas tienen bioactivos</p>
        </div>
      </div>

      {/* Top Meals */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Top Comidas del Período</h3>
        <div className="space-y-4">
          {topMeals.length > 0 ? topMeals.map((meal, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-base text-gray-900 dark:text-white">
                      {idx + 1}. {meal.meal_name ?? '—'}
                    </h4>
                    {meal.has_bioactives && (
                      <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                        🌱 {typeof meal.bioactives_pct === 'number' ? meal.bioactives_pct.toFixed(0) : 'N/A'}% bioactivos
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Consumida {meal.frequency ?? 0} {meal.frequency === 1 ? 'vez' : 'veces'}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{typeof meal.balance_score === 'number' ? meal.balance_score.toFixed(0) : 'N/A'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Balance</p>
                </div>
              </div>

              {/* Classification */}
              <div className="mb-3">
                <span className={`text-xs px-3 py-1 rounded font-medium ${getBalanceColor(meal.balance_classification ?? '')}`}>
                  {meal.balance_classification ?? '—'}
                </span>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                <div className="bg-white dark:bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Calorías</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {typeof meal.avg_calories === 'number' ? meal.avg_calories.toFixed(0) : 'N/A'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Proteínas</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {meal.avg_proteins_g?.toFixed(1) ?? 0}g
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Carbos</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {meal.avg_carbs_g?.toFixed(1) ?? 0}g
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Grasas</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {meal.avg_fats_g?.toFixed(1) ?? 0}g
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fibra</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {meal.avg_fiber_g?.toFixed(1) ?? 0}g
                  </p>
                </div>
              </div>

              {/* Imbalance Issues */}
              {(meal.imbalance_issues ?? []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Problemas de Balance:</p>
                  <div className="flex flex-wrap gap-1">
                    {(meal.imbalance_issues ?? []).map((issue, iidx) => (
                      <span
                        key={iidx}
                        className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-2 py-1 rounded"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Ingredients */}
              {(meal.top_ingredients ?? []).length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Ingredientes Principales:</p>
                  <div className="flex flex-wrap gap-2">
                    {(meal.top_ingredients ?? []).map((ing, iidx) => (
                      <span
                        key={iidx}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                      >
                        {ing.food ?? '—'} ({ing.count ?? 'N/A'})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="text-sm text-gray-600 dark:text-gray-400 p-4">No hay comidas</div>
          )}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Recomendación</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">{mealAnalysis.recommendation}</p>
            {mealAnalysis.message && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{mealAnalysis.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
