import React, { useMemo } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine } from 'recharts'
import type { NutrientTrendData } from '../../../../types/medicalApiTypes'

interface NutrientCardProps {
  boxplot: any
  nutrientData: NutrientTrendData
  nutrientDailyData: Record<string, Array<{ date: string; value: number }>>
  getStatusColor: (status: string) => string
  getStatusBgColor: (status: string) => string
}

const NutrientCard: React.FC<NutrientCardProps> = ({
  boxplot,
  nutrientData,
  nutrientDailyData,
  getStatusColor,
  getStatusBgColor,
}) => {
  return (
    <div
      className={`border rounded-lg p-4 ${getStatusBgColor(boxplot.status)}`}
    >
      {/* Header del nutriente */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">
            {boxplot.nutrient}
          </h4>
          <span
            className="inline-block text-xs px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: getStatusColor(boxplot.status) + '20',
              color: getStatusColor(boxplot.status),
              border: `1px solid ${getStatusColor(boxplot.status)}40`
            }}
          >
            {boxplot.status}
          </span>
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {boxplot.average.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Promedio</p>
        </div>
      </div>

      {/* Gráfico de tendencia diaria */}
      {nutrientDailyData[boxplot.nutrient_key] && nutrientDailyData[boxplot.nutrient_key].length > 0 && (
        <div className="mb-3 bg-white/60 dark:bg-black/20 rounded p-2">
          <p className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Tendencia del período</p>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={nutrientDailyData[boxplot.nutrient_key]}>
              <YAxis
                domain={[0, 'dataMax']}
                ticks={[boxplot.average]}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
                width={30}
              />
              <ReferenceLine
                y={boxplot.average}
                stroke={getStatusColor(boxplot.status)}
                strokeOpacity={0.2}
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getStatusColor(boxplot.status)}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Inicio</span>
            <span>Final</span>
          </div>
        </div>
      )}

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/60 dark:bg-black/20 rounded p-2 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Mínimo</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{boxplot.min.toFixed(1)}%</p>
        </div>
        <div className="bg-white/60 dark:bg-black/20 rounded p-2 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Mediana</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{boxplot.median.toFixed(1)}%</p>
        </div>
        <div className="bg-white/60 dark:bg-black/20 rounded p-2 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Máximo</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{boxplot.max.toFixed(1)}%</p>
        </div>
      </div>

      {/* Distribución de días */}
      <div className="mb-3">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Distribución de días:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {/* Días óptimos (>90%) */}
          <div className="bg-green-100 dark:bg-green-900/30 rounded p-2 text-center">
            <p className="text-xs text-green-700 dark:text-green-300">Óptimos (&gt; 90%)</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-200">
              {(() => {
                const dailyData = nutrientDailyData[boxplot.nutrient_key] || []
                return dailyData.filter(d => d.value > 90).length
              })()}
            </p>
          </div>

          {/* Días sub-óptimos (70-90%) */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-2 text-center">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">Sub-óptimos (70-90%)</p>
            <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
              {(() => {
                const dailyData = nutrientDailyData[boxplot.nutrient_key] || []
                return dailyData.filter(d => d.value >= 70 && d.value <= 90).length
              })()}
            </p>
          </div>

          {/* Días deficientes (<70%) */}
          <div className="bg-red-100 dark:bg-red-900/30 rounded p-2 text-center">
            <p className="text-xs text-red-700 dark:text-red-300">Deficientes (&lt; 70%)</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-200">
              {(() => {
                const dailyData = nutrientDailyData[boxplot.nutrient_key] || []
                return dailyData.filter(d => d.value < 70).length
              })()}
            </p>
          </div>

          {/* Días en exceso (>110%) */}
          {(() => {
            const dailyData = nutrientDailyData[boxplot.nutrient_key] || []
            const excessDays = dailyData.filter(d => d.value > 110).length
            return excessDays > 0 ? (
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded p-2 text-center">
                <p className="text-xs text-orange-700 dark:text-orange-300">Exceso (&gt; 110%)</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-200">
                  {excessDays}
                </p>
              </div>
            ) : null
          })()}
        </div>
      </div>

      {/* Top fuentes - Más compacto */}
      {nutrientData.top_food_sources && nutrientData.top_food_sources.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Principales fuentes:
          </p>
          <div className="flex flex-wrap gap-1">
            {nutrientData.top_food_sources.slice(0, 5).map((source, sidx) => (
              <span
                key={sidx}
                className="text-xs bg-white/80 dark:bg-black/30 px-2 py-1 rounded text-gray-900 dark:text-gray-200"
              >
                {source.food_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recomendación */}
      <div className="bg-white/60 dark:bg-black/20 rounded p-3">
        <p className="text-xs leading-relaxed text-gray-900 dark:text-gray-200">
          <span className="mr-1">💡</span>
          {nutrientData.recommendation}
        </p>
      </div>
    </div>
  )
}

// Definición de nutrientes por categorías
const COMPLIANCE_NUTRIENTS = [
  { key: 'proteins_g', label: 'Proteínas', category: 'protein' },
  { key: 'carbs_g', label: 'Carbohidrato', category: 'carb' },
  { key: 'starches_g', label: 'Almidón', category: 'carb' },
  { key: 'sugars_g', label: 'Azúcar', category: 'carb' },
  { key: 'fiber_g', label: 'Fibra', category: 'fiber' },
  { key: 'fiber_insoluble_g', label: 'Fibra Insoluble', category: 'fiber' },
  { key: 'fiber_soluble_g', label: 'Fibra Soluble', category: 'fiber' },
  { key: 'fats_g', label: 'Grasas', category: 'fat' },
  { key: 'sfa_g', label: 'Saturadas', category: 'fat' },
  { key: 'mufa_g', label: 'MUFA', category: 'fat' },
  { key: 'pufa_g', label: 'PUFA', category: 'fat' },
  { key: 'omega_3_epa_dha_mg', label: 'Ω-3 EPA/DHA', category: 'fat' },
  { key: 'omega_3_ala_g', label: 'Ω-3 ALA', category: 'fat' },
  { key: 'omega_6_la_g', label: 'Ω-6 LA', category: 'fat' },
  { key: 'calcium', label: 'Calcio', category: 'mineral' },
  { key: 'iron', label: 'Hierro', category: 'mineral' },
  { key: 'magnesium', label: 'Magnesio', category: 'mineral' },
  { key: 'zinc', label: 'Zinc', category: 'mineral' },
  { key: 'potassium', label: 'Potasio', category: 'mineral' },
  { key: 'sodium', label: 'Sodio', category: 'mineral' },
  { key: 'folate', label: 'Folato', category: 'vitamin' },
  { key: 'vitamin_b1', label: 'B1', category: 'vitamin' },
  { key: 'vitamin_b2', label: 'B2', category: 'vitamin' },
  { key: 'vitamin_b6', label: 'B6', category: 'vitamin' },
  { key: 'vitamin_b12', label: 'B12', category: 'vitamin' },
  { key: 'vitamin_c', label: 'Vit C', category: 'vitamin' },
  { key: 'vitamin_d', label: 'Vit D', category: 'vitamin' },
]

// Mapeo de categorías a nombres de display
const CATEGORY_NAMES = {
  protein: 'Proteínas',
  carb: 'Carbohidrato',
  fiber: 'Fibra',
  fat: 'Grasas',
  mineral: 'Minerales',
  vitamin: 'Vitaminas',
}

// Orden de las categorías
const CATEGORY_ORDER = ['protein', 'carb', 'fiber', 'fat', 'mineral', 'vitamin']

interface PeriodNutrientCardsProps {
  filteredBoxplotData: any[]
  byNutrient: Record<string, NutrientTrendData>
  nutrientDailyData: Record<string, Array<{ date: string; value: number }>>
  getStatusColor: (status: string) => string
  getStatusBgColor: (status: string) => string
}

export const PeriodNutrientCards: React.FC<PeriodNutrientCardsProps> = ({
  filteredBoxplotData,
  byNutrient,
  nutrientDailyData,
  getStatusColor,
  getStatusBgColor,
}) => {
  // Agrupar nutrientes por categoría
  const nutrientsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {}

    // Inicializar categorías vacías
    CATEGORY_ORDER.forEach(category => {
      grouped[category] = []
    })

    // Agrupar los datos filtrados por categoría
    filteredBoxplotData.forEach(boxplot => {
      const nutrientDef = COMPLIANCE_NUTRIENTS.find(n => n.key === boxplot.nutrient_key)
      if (nutrientDef) {
        grouped[nutrientDef.category].push(boxplot)
      } else {
        // Si no está definido, ponerlo en una categoría 'other'
        if (!grouped['other']) grouped['other'] = []
        grouped['other'].push(boxplot)
      }
    })

    // Ordenar dentro de cada categoría según el orden en COMPLIANCE_NUTRIENTS
    Object.keys(grouped).forEach(category => {
      if (category !== 'other') {
        grouped[category].sort((a, b) => {
          const aIndex = COMPLIANCE_NUTRIENTS.findIndex(n => n.key === a.nutrient_key)
          const bIndex = COMPLIANCE_NUTRIENTS.findIndex(n => n.key === b.nutrient_key)
          return aIndex - bIndex
        })
      }
    })

    return grouped
  }, [filteredBoxplotData])

  return (
    <div>
      <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
        Análisis detallado por nutriente
      </h3>

      {CATEGORY_ORDER.map(category => {
        const nutrients = nutrientsByCategory[category]
        if (!nutrients || nutrients.length === 0) return null

        return (
          <div key={category} className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
              {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nutrients.map((boxplot, idx) => {
                const nutrientData = byNutrient[boxplot.nutrient_key]
                if (!nutrientData) return null

                return (
                  <NutrientCard
                    key={`${category}-${idx}`}
                    boxplot={boxplot}
                    nutrientData={nutrientData}
                    nutrientDailyData={nutrientDailyData}
                    getStatusColor={getStatusColor}
                    getStatusBgColor={getStatusBgColor}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Categoría 'other' si existe */}
      {nutrientsByCategory['other'] && nutrientsByCategory['other'].length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
            Otros
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nutrientsByCategory['other'].map((boxplot, idx) => {
              const nutrientData = byNutrient[boxplot.nutrient_key]
              if (!nutrientData) return null

              return (
                <NutrientCard
                  key={`other-${idx}`}
                  boxplot={boxplot}
                  nutrientData={nutrientData}
                  nutrientDailyData={nutrientDailyData}
                  getStatusColor={getStatusColor}
                  getStatusBgColor={getStatusBgColor}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}