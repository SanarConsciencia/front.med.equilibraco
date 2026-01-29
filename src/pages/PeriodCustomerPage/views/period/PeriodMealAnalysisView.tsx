import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts'
import type { BulkComplianceResponse } from '../../../../types/medicalApiTypes'

interface PeriodMealAnalysisViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodMealAnalysisView: React.FC<PeriodMealAnalysisViewProps> = ({ complianceData }) => {
  const mealAnalysis = complianceData.period_summary.analysis.meal_analysis
  const slotsAnalyzed = mealAnalysis.slots_analyzed || []
  const slotAnalysis = mealAnalysis.slot_analysis || {}
  const periodSummary = mealAnalysis.period_summary

  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    slotsAnalyzed.length > 0 ? slotsAnalyzed[0] : null
  )

  // Si no hay datos
  if (slotsAnalyzed.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Análisis de comidas por slot
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos disponibles para análisis de platos
          </p>
        </div>
      </div>
    )
  }

  // Preparar datos para gráfico de consistencia
  const consistencyData = slotsAnalyzed.map(slotId => ({
    slot: slotId,
    consistencia: slotAnalysis[slotId].metadata.consistency_score,
    balance: slotAnalysis[slotId].categorization.balance_score,
  }))

  // Preparar datos para radar de macro distribución
  const selectedSlotData = selectedSlot ? slotAnalysis[selectedSlot] : null
  const macroData = selectedSlotData ? [
    {
      nutrient: 'Proteína',
      value: selectedSlotData.categorization.macro_distribution.protein_pct,
    },
    {
      nutrient: 'Carbohidratos',
      value: selectedSlotData.categorization.macro_distribution.carb_pct,
    },
    {
      nutrient: 'Grasas',
      value: selectedSlotData.categorization.macro_distribution.fat_pct,
    },
  ] : []

  // Función para obtener color según prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
    }
  }

  // Función para obtener icono según categoría
  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase()
    if (lower.includes('proteína')) return '🥩'
    if (lower.includes('carbohidrato')) return '🍚'
    if (lower.includes('gras')) return '🥑'
    if (lower.includes('balanceado')) return '⚖️'
    if (lower.includes('bajo')) return '⚠️'
    return '🍽️'
  }

  // Colores para barras
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444']

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Análisis de comidas por slot
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Análisis detallado de cada momento de comida del período
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Resumen del período - Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                  Slots analizados
                </p>
                <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-100">
                  {periodSummary.total_slots_analyzed}
                </p>
              </div>
              <div className="text-4xl">🍽️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  Más consistente
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {periodSummary.most_consistent_slot || 'N/A'}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Mejor balanceado
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {periodSummary.best_balanced_slot || 'N/A'}
                </p>
              </div>
              <div className="text-4xl">⚖️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                  Adherencia pattern
                </p>
                <p className="text-4xl font-bold text-amber-900 dark:text-amber-100">
                  {periodSummary.overall_pattern_adherence.toFixed(0)}%
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Slots que necesitan atención */}
        {periodSummary.slots_needing_attention.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-red-900 dark:text-red-200 mb-3">
                  Slots que necesitan atención ({periodSummary.slots_needing_attention.length})
                </h3>
                <div className="space-y-2">
                  {periodSummary.slots_needing_attention.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${getPriorityColor(slot.priority)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{slot.slot_id}</span>
                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded uppercase font-bold">
                          {slot.priority}
                        </span>
                      </div>
                      <ul className="text-xs space-y-1">
                        {slot.reasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de consistencia y balance por slot */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            📊 Consistencia y balance por slot
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consistencyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="slot" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Bar dataKey="consistencia" fill="#6366F1" name="Consistencia %" radius={[8, 8, 0, 0]} />
              <Bar dataKey="balance" fill="#10B981" name="Balance %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selector de slot */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Análisis detallado por slot
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {slotsAnalyzed.map(slotId => (
              <button
                key={slotId}
                onClick={() => setSelectedSlot(slotId)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSlot === slotId
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {slotId}
              </button>
            ))}
          </div>

          {/* Detalles del slot seleccionado */}
          {selectedSlotData && (
            <div className="space-y-4">
              {/* Card de metadata y categorización */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Metadata */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200">
                      Información general
                    </h4>
                    <span className="text-3xl">{getCategoryIcon(selectedSlotData.categorization.primary_category)}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700 dark:text-purple-300">Apariciones:</span>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {selectedSlotData.metadata.total_occurrences}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700 dark:text-purple-300">Días presente:</span>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {selectedSlotData.metadata.days_present} / {selectedSlotData.metadata.days_present + selectedSlotData.metadata.days_missing}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700 dark:text-purple-300">Consistencia:</span>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {selectedSlotData.metadata.consistency_score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categorización */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h4 className="font-semibold text-teal-900 dark:text-teal-200 mb-4">
                    Categorización
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-teal-700 dark:text-teal-300">Categoría principal:</span>
                      <p className="text-lg font-bold text-teal-900 dark:text-teal-100">
                        {selectedSlotData.categorization.primary_category}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedSlotData.categorization.secondary_traits.map((trait, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200 rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-xs text-teal-700 dark:text-teal-300">Balance:</span>
                        <p className="font-semibold text-teal-900 dark:text-teal-100">
                          {selectedSlotData.categorization.balance_score}/100
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-teal-700 dark:text-teal-300">Consistencia:</span>
                        <p className="font-semibold text-teal-900 dark:text-teal-100">
                          {selectedSlotData.categorization.consistency_score}/100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de distribución de macros (Radar) */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Distribución de macronutrientes
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={macroData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="nutrient" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 45]} 
                      tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    />
                    <Radar
                      name="% Calorías"
                      dataKey="value"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value: any) => [`${value.toFixed(1)}%`, '% de calorías']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Ingredientes analysis */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Ingredientes ({selectedSlotData.ingredients_analysis.total_unique_ingredients} únicos)
                </h4>
                
                <div className="space-y-3">
                  {/* Core ingredients */}
                  {selectedSlotData.ingredients_analysis.core_ingredients.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        🌟 Ingredientes core (&gt;70% frecuencia)
                      </h5>
                      <div className="space-y-2">
                        {selectedSlotData.ingredients_analysis.core_ingredients.map((ing, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"
                          >
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {ing.food_name}
                              </span>
                              <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                <span>Frecuencia: {ing.frequency_pct.toFixed(0)}%</span>
                                <span>•</span>
                                <span>Peso prom: {ing.avg_weight_g.toFixed(0)}g</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common ingredients */}
                  {selectedSlotData.ingredients_analysis.common_ingredients.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ⭐ Ingredientes comunes (40-70% frecuencia)
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedSlotData.ingredients_analysis.common_ingredients.map((ing, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full"
                          >
                            {ing.food_name} ({ing.frequency_pct.toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Occasional ingredients count */}
                  {selectedSlotData.ingredients_analysis.occasional_ingredients.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      + {selectedSlotData.ingredients_analysis.occasional_ingredients.length} ingredientes ocasionales
                    </div>
                  )}
                </div>
              </div>

              {/* Recomendaciones por prioridad */}
              {selectedSlotData.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    💡 Recomendaciones ({selectedSlotData.recommendations.length})
                  </h4>
                  
                  {['high', 'medium', 'low'].map(priority => {
                    const recs = selectedSlotData.recommendations.filter(r => r.priority === priority)
                    if (recs.length === 0) return null

                    return (
                      <div key={priority}>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase">
                          Prioridad {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'}
                        </h5>
                        <div className="space-y-2">
                          {recs.map((rec, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-lg">{rec.actionable ? '✅' : 'ℹ️'}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold uppercase">
                                      {rec.category}
                                    </span>
                                  </div>
                                  <p className="text-sm">{rec.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Compliance analysis (si está disponible) */}
              {selectedSlotData.compliance_analysis.available && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">
                    📈 Análisis de compliance
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-indigo-700 dark:text-indigo-300">Compliance promedio:</span>
                      <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        {selectedSlotData.compliance_analysis.avg_compliance?.toFixed(1)}%
                      </p>
                    </div>
                    {selectedSlotData.compliance_analysis.best_compliance_day && (
                      <div>
                        <span className="text-xs text-indigo-700 dark:text-indigo-300">Mejor día:</span>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-100">
                          {selectedSlotData.compliance_analysis.best_compliance_day.compliance.toFixed(0)}%
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                          {selectedSlotData.compliance_analysis.best_compliance_day.date}
                        </p>
                      </div>
                    )}
                    {selectedSlotData.compliance_analysis.worst_compliance_day && (
                      <div>
                        <span className="text-xs text-indigo-700 dark:text-indigo-300">Peor día:</span>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-100">
                          {selectedSlotData.compliance_analysis.worst_compliance_day.compliance.toFixed(0)}%
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                          {selectedSlotData.compliance_analysis.worst_compliance_day.date}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}