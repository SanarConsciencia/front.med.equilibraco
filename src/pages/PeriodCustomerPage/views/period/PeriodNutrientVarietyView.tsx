import React from 'react'
import type { BulkComplianceResponse } from '../../../../types/medicalApiTypes'

interface PeriodNutrientVarietyViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodNutrientVarietyView: React.FC<PeriodNutrientVarietyViewProps> = ({ complianceData }) => {
  const variety = complianceData.period_summary.analysis.nutrient_variety

  // Calcular alimentos por frecuencia
  const foodsByFrequency = {
    muyFrecuente: variety.top_10_most_consumed.filter(f => f.count >= 5).length,
    frecuente: variety.top_10_most_consumed.filter(f => f.count >= 3 && f.count < 5).length,
    ocasional: variety.unique_foods_count - variety.top_10_most_consumed.filter(f => f.count >= 3).length,
  }

  // Porcentaje de meta alcanzada
  const metaPercentage = Math.min(100, (variety.prebiotic_foods_count / variety.weekly_goal) * 100)

  // Categorías más y menos representadas
  const sortedCategories = Object.entries(variety.category_distribution).sort(([,a], [,b]) => b - a)
  const topCategory = sortedCategories[0]
  const bottomCategory = sortedCategories[sortedCategories.length - 1]

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Variedad nutricional
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Análisis de diversidad y balance alimentario del período
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Score destacado y meta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Variety Score - Visual destacado */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                  Índice de diversidad
                </p>
                <p className="text-5xl font-bold text-indigo-900 dark:text-indigo-100">
                  {variety.variety_score}
                  <span className="text-2xl text-indigo-600 dark:text-indigo-400">/100</span>
                </p>
              </div>
              <div className="text-6xl">🌈</div>
            </div>
            <div className="w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${variety.variety_score}%` }}
              />
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2">
              {variety.variety_score >= 80 ? 'Excelente diversidad' : variety.variety_score >= 60 ? 'Buena diversidad' : 'Mejorar diversidad'}
            </p>
          </div>

          {/* Meta semanal - Visual con progreso circular */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  Meta semanal de prebióticos
                </p>
                <p className="text-5xl font-bold text-green-900 dark:text-green-100">
                  {variety.prebiotic_foods_count}
                  <span className="text-2xl text-green-600 dark:text-green-400">/{variety.weekly_goal}</span>
                </p>
              </div>
              <div className="text-6xl">
                {variety.meets_weekly_goal ? '✅' : '🎯'}
              </div>
            </div>
            <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${metaPercentage}%` }}
              />
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              {variety.meets_weekly_goal ? '¡Meta alcanzada!' : `Faltan ${variety.weekly_goal - variety.prebiotic_foods_count} alimentos`}
            </p>
          </div>
        </div>

        {/* Stats grid - 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="text-3xl mb-2">🥗</div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {variety.unique_foods_count}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Alimentos únicos</p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="text-center">
              <div className="text-3xl mb-2">🌾</div>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {variety.prebiotic_foods_count}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Prebióticos</p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {sortedCategories.length}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Categorías</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {foodsByFrequency.muyFrecuente}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Muy frecuentes</p>
            </div>
          </div>
        </div>

        {/* Balance de categorías */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Balance por categoría
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded">
                Top: {topCategory[0]} ({topCategory[1]})
              </span>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 rounded">
                Menos: {bottomCategory[0]} ({bottomCategory[1]})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedCategories.map(([category, count]) => {
              const percentage = (count / variety.unique_foods_count) * 100
              const isTop = category === topCategory[0]
              const isBottom = category === bottomCategory[0]
              
              return (
                <div
                  key={category}
                  className={`rounded-lg p-3 border ${
                    isTop
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : isBottom
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isTop
                          ? 'bg-green-500'
                          : isBottom
                          ? 'bg-orange-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {percentage.toFixed(0)}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top 10 más consumidos - Formato mejorado */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
            Alimentos más frecuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {variety.top_10_most_consumed.map((item, idx) => {
              const intensity = item.count >= 5 ? 'high' : item.count >= 3 ? 'medium' : 'low'
              const colors = {
                high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300',
                medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300',
                low: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
              }

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${colors[intensity]}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg font-bold opacity-50">#{idx + 1}</span>
                    <span className="text-sm font-medium truncate">{item.food}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(item.count, 10) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-4 bg-current opacity-70 rounded-sm" />
                      ))}
                    </div>
                    <span className="text-lg font-bold ml-2">{item.count}×</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alimentos únicos - Vista compacta mejorada */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Todos los alimentos ({variety.unique_foods_count})
            </h3>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Ver detalles
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {variety.unique_foods.map((food, idx) => {
                // Verificar si es prebiótico
                const isPrebiotic = variety.prebiotic_foods.includes(food)
                
                return (
                  <span
                    key={idx}
                    className={`inline-block text-xs px-3 py-1.5 rounded-full font-medium ${
                      isPrebiotic
                        ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                        : 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {isPrebiotic && '🌱 '}
                    {food}
                  </span>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            🌱 = Alimento prebiótico
          </p>
        </div>

        {/* Recomendación */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
                Recomendación
              </h4>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                {variety.recommendation}
              </p>
              {variety.message && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                  {variety.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}