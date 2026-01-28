import React, { useState, useMemo } from 'react'
import { PeriodNutrientTrendsChart } from './period/PeriodNutrientTrendsChart'
import { PeriodNutrientCards } from './PeriodNutrientCards'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodNutrientTrendsViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodNutrientTrendsView: React.FC<PeriodNutrientTrendsViewProps> = ({ complianceData }) => {
  const trends = complianceData.period_summary.analysis.nutrient_trends
  const boxplotData = trends.boxplot_data ?? []
  const byNutrient = trends.by_nutrient ?? {}
  const summary = trends.summary ?? ''
  const lowNutrients = trends.low_nutrients ?? []
  const highNutrients = trends.high_nutrients ?? []
  const optimalNutrients = Object.keys(byNutrient).filter(key => {
    const nutrient = byNutrient[key]
    return nutrient.status && (nutrient.status.toLowerCase().includes('óptimo') || nutrient.status.toLowerCase().includes('adecuado'))
  })
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'low' | 'high' | 'optimal' | 'variable'>('all')

  // Gráfico fijo de 0 a 200%
  const chartMinValue = 0
  const chartMaxValue = 200

  // Preparar datos filtrados para el gráfico
  const filteredBoxplotData = boxplotData.filter(item => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'low') return lowNutrients.includes(item.nutrient)
    if (selectedCategory === 'high') return highNutrients.includes(item.nutrient)
    if (selectedCategory === 'optimal') return optimalNutrients.includes(item.nutrient_key)
    if (selectedCategory === 'variable') return item.status.toLowerCase().includes('variable')
    return true
  }).map(item => ({
    ...item,
    // Agregar un valor de referencia fijo para que Recharts calcule correctamente el área de ploteo
    _chartRef: chartMaxValue
  }))

  // Procesar datos diarios de compliance por nutriente para gráficos de tendencia
  const nutrientDailyData = useMemo(() => {
    const days = complianceData.days || []
    const nutrientMap: Record<string, Array<{ date: string; value: number }>> = {}

    // Iterar sobre cada día y extraer compliance de cada nutriente
    days.forEach(day => {
      const dateStr = day.day.date
      const totalCompliance = (day.compliance?.total as unknown) as Record<string, number> || {}

      // Extraer todos los nutrientes que tienen datos
      Object.keys(totalCompliance).forEach(nutrientKey => {
        const value = totalCompliance[nutrientKey]
        if (typeof value === 'number') {
          if (!nutrientMap[nutrientKey]) {
            nutrientMap[nutrientKey] = []
          }
          nutrientMap[nutrientKey].push({ date: dateStr, value })
        }
      })
    })

    return nutrientMap
  }, [complianceData.days])

  const getStatusColor = (status: string) => {
    const lower = (status || '').toLowerCase()
    if (lower.includes('bajo') || lower.includes('deficiente')) {
      return '#EF4444'
    }
    if (lower.includes('alto') || lower.includes('exceso')) {
      return '#F97316'
    }
    if (lower.includes('óptimo') || lower.includes('adecuado')) {
      return '#10B981'
    }
    return '#F59E0B'
  }

  const getStatusBgColor = (status: string) => {
    const lower = (status || '').toLowerCase()
    if (lower.includes('bajo') || lower.includes('deficiente')) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
    }
    if (lower.includes('alto') || lower.includes('exceso')) {
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
    }
    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      const nutrientKey = data.nutrient_key
      const nutrientData = byNutrient[nutrientKey]

      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg max-w-md">
          <h4 className="text-white font-semibold mb-2">{data.nutrient}</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">Promedio: <span className="font-semibold text-white">{data.average.toFixed(1)}%</span></p>
            <p className="text-gray-400 text-xs">
              Min: {data.min.toFixed(1)}% | Q1: {data.q1.toFixed(1)}% | Med: {data.median.toFixed(1)}% | Q3: {data.q3.toFixed(1)}% | Max: {data.max.toFixed(1)}%
            </p>
            <p className="text-gray-300">Estado: <span className={`font-semibold`} style={{ color: getStatusColor(data.status) }}>{data.status}</span></p>
            {nutrientData && nutrientData.recommendation && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-blue-300 text-xs">💡 {nutrientData.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tendencias de nutrientes
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{summary}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                  Con deficiencia
                </p>
                <p className="text-4xl font-bold text-red-900 dark:text-red-100">
                  {lowNutrients.length}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {lowNutrients.slice(0, 2).join(', ')}
                  {lowNutrients.length > 2 && `... +${lowNutrients.length - 2}`}
                </p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                  Con exceso
                </p>
                <p className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                  {highNutrients.length}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  {highNutrients.length > 0 ? highNutrients.join(', ') : 'Ninguno'}
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  Óptimos
                </p>
                <p className="text-4xl font-bold text-green-900 dark:text-green-100">
                  {optimalNutrients.length}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Bien balanceados
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Total analizados
                </p>
                <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                  {boxplotData.length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Nutrientes evaluados
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Gráfico de distribución */}
        {filteredBoxplotData.length > 0 ? (
          <PeriodNutrientTrendsChart
            boxplotData={filteredBoxplotData}
            chartMinValue={chartMinValue}
            chartMaxValue={chartMaxValue}
            getStatusColor={getStatusColor}
            CustomTooltip={CustomTooltip}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            allBoxplotData={boxplotData}
            lowNutrients={lowNutrients}
            highNutrients={highNutrients}
            optimalNutrients={optimalNutrients}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            No hay datos disponibles para esta categoría
          </div>
        )}

        {/* Cards de nutrientes - Grid compacto */}
        <PeriodNutrientCards
          filteredBoxplotData={filteredBoxplotData}
          byNutrient={byNutrient}
          nutrientDailyData={nutrientDailyData}
          getStatusColor={getStatusColor}
          getStatusBgColor={getStatusBgColor}
        />
      </div>
    </div>
  )
}