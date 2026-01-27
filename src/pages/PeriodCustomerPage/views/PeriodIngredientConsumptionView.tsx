import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodIngredientConsumptionViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodIngredientConsumptionView: React.FC<PeriodIngredientConsumptionViewProps> = ({ complianceData }) => {
  const consumption = complianceData.period_summary.analysis.ingredient_consumption
  const totalIngredients = consumption?.total_ingredients ?? 0
  const totalWeightKg = typeof consumption?.total_weight_kg === 'number' ? consumption.total_weight_kg : 0
  const categoryBreakdown = consumption?.category_breakdown ?? []
  const usageGroups = consumption?.usage_intensity_groups ?? []
  const topIngredients = consumption?.top_ingredients ?? []
  const recommendation = consumption?.recommendation ?? ''
  const message = consumption?.message ?? ''
  const totalDays = complianceData.period?.total_days ?? 1

  const getIntensityColor = (intensity: string) => {
    const lower = intensity.toLowerCase()
    if (lower.includes('alto') || lower.includes('high')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
    }
    if (lower.includes('medio') || lower.includes('medium') || lower.includes('moderado')) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
    }
    if (lower.includes('bajo') || lower.includes('low')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
  }

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consumo de Ingredientes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {totalIngredients} ingredientes únicos • {totalWeightKg.toFixed(2)} kg totales
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <span className="text-3xl mb-2 block">🥗</span>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalIngredients}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ingredientes únicos</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
          <span className="text-3xl mb-2 block">⚖️</span>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalWeightKg.toFixed(2)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">kg totales</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-white">{(totalWeightKg / (totalDays || 1)).toFixed(2)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">kg/día promedio</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Distribución por Categoría</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            {categoryBreakdown.slice().sort((a, b) => (b.total_weight_kg ?? 0) - (a.total_weight_kg ?? 0)).map((category, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {category.count ?? 0} ingredientes
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {typeof category.percentage === 'number' ? category.percentage.toFixed(1) : 'N/A'}% del total
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-indigo-500 dark:bg-indigo-400 h-3 rounded-full transition-all"
                        style={{ width: `${category.percentage ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {typeof category.total_weight_kg === 'number' ? category.total_weight_kg.toFixed(2) : 'N/A'} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Intensity Groups */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Intensidad de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usageGroups.length > 0 ? usageGroups.map((group, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${getIntensityColor(group.intensity ?? '')}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-base capitalize">{group.intensity ?? '—'}</h4>
                <span className="text-2xl font-bold">{group.count ?? 0}</span>
              </div>
              <div className="max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {(group.ingredients ?? []).slice(0, 10).map((ingredient, iidx) => (
                    <p key={iidx} className="text-xs opacity-90">• {ingredient}</p>
                  ))}
                  {(group.ingredients ?? []).length > 10 && (
                    <p className="text-xs italic opacity-75">+{(group.ingredients ?? []).length - 10} más...</p>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-gray-600 dark:text-gray-400 p-4">No hay grupos de intensidad</div>
          )}
        </div>
      </div>

      {/* Top Ingredients */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Top Ingredientes</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">#</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Ingrediente</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Peso Total</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Frecuencia</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Días</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Porción Prom.</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Intensidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topIngredients.length > 0 ? topIngredients.map((ingredient, idx) => (
                  <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ingredient.food_name ?? '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ingredient.category ?? ''}</p>
                        {ingredient.has_bioactives && (
                          <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded mt-1 inline-block">
                            🌱 Bioactivos
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{typeof ingredient.total_weight_kg === 'number' ? ingredient.total_weight_kg.toFixed(2) : 'N/A'} kg</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">({typeof ingredient.total_weight_g === 'number' ? ingredient.total_weight_g.toFixed(0) : 'N/A'}g)</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {ingredient.frequency ?? 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                      {ingredient.days_used ?? 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                      {typeof ingredient.avg_portion_g === 'number' ? ingredient.avg_portion_g.toFixed(0) + 'g' : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${getIntensityColor(ingredient.usage_intensity ?? '')}`}>
                        {ingredient.usage_intensity ?? '—'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">No hay ingredientes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Recomendación</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">{consumption.recommendation}</p>
            {consumption.message && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{consumption.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
