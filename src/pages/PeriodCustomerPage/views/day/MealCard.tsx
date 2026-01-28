import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts' 

interface MealCardProps {
  meal: any
  selectedNutrients: string[]
  AVAILABLE_NUTRIENTS: Array<any>
  NUTRIENT_CONFIG: Array<any>
  getCategoryClasses: (category: string | undefined, isSelected: boolean) => string
  getColorClasses: (color: string, isSelected: boolean) => string
  complianceBySlot?: Array<any>
}

// Nutrient categories configuration
const CATEGORY_COLORS: Record<string, string> = {
  protein: '#8b5cf6', // violet
  carb: '#3b82f6',    // blue
  fiber: '#10b981',   // green
  fat: '#f59e0b',     // amber
  mineral: '#ec4899', // pink
  vitamin: '#14b8a6', // teal
}

// Nutrient groups for compliance chart (expanded)
const COMPLIANCE_NUTRIENTS = [
  { key: 'proteins_g', label: 'Proteínas', category: 'protein' },
  { key: 'carbs_g', label: 'Carbos', category: 'carb' },
  { key: 'starches_g', label: 'Almidón', category: 'carb' },
  { key: 'sugars_g', label: 'Azúcar', category: 'carb' },
  { key: 'fiber_g', label: 'Fibra', category: 'fiber' },
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

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  selectedNutrients,
  AVAILABLE_NUTRIENTS,
  NUTRIENT_CONFIG,
  getCategoryClasses,
  getColorClasses,
  complianceBySlot,
}) => {
  // Find compliance data for this meal by slot_id
  const slotCompliance = useMemo(() => {
    if (!complianceBySlot || !meal.slot_id) return null
    return complianceBySlot.find(slot => slot.slot_id === meal.slot_id)
  }, [complianceBySlot, meal.slot_id])

  // Prepare compliance chart data - compute raw values then scaled values so 0..100% uses most of the chart
  // Scales: 0..100 -> 0..(SCALE_BELOW*100), values >100 -> remaining SCALE_ABOVE*100
  const SCALE_BELOW = 0.75
  const SCALE_ABOVE = 0.25

  const rawComplianceData = useMemo(() => {
    if (!slotCompliance) return []

    return COMPLIANCE_NUTRIENTS
      .map((n) => {
        const raw = slotCompliance[n.key]
        if (raw === null || raw === undefined) return null
        const value = typeof raw === 'number' ? Number(raw) : Number(raw)
        return { nutrient: n.label, key: n.key, category: n.category, value }
      })
      .filter(Boolean) as Array<{ nutrient: string; key: string; category: string; value: number }>
  }, [slotCompliance])

  const chartMaxRaw = useMemo(() => {
    if (!rawComplianceData || rawComplianceData.length === 0) return 100
    const maxVal = Math.max(...rawComplianceData.map((d) => d.value))
    return Math.max(100, maxVal)
  }, [rawComplianceData])

  const complianceChartData = useMemo(() => {
    if (!rawComplianceData || rawComplianceData.length === 0) return []

    return rawComplianceData.map((d) => {
      const v = d.value
      let scaled = 0
      if (v <= 100) {
        scaled = v * SCALE_BELOW
      } else {
        // avoid division by zero when chartMaxRaw == 100 (shouldn't happen because v > 100)
        const denom = chartMaxRaw - 100 || 1
        const abovePortion = ((v - 100) / denom) * (SCALE_ABOVE * 100)
        scaled = SCALE_BELOW * 100 + abovePortion
      }

      // scaled is in 0..100 range
      return { ...d, scaled: Number(scaled.toFixed(2)), origValue: d.value }
    })
  }, [rawComplianceData, chartMaxRaw])

  // Custom tooltip for compliance chart (shows original value)
  const ComplianceTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    
    const entry = payload[0]
    const orig = entry?.payload?.origValue ?? entry?.payload?.value ?? entry?.value
    const percent = Number(orig)

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-white">{entry.payload.nutrient}</p>
        <p className={`text-sm font-bold ${
          percent >= 90 ? 'text-green-600 dark:text-green-400' :
          percent >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {percent}%
        </p>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4">
      {/* Meal Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-base text-gray-900 dark:text-white">{meal.meal_name}</h4>
        <div className="flex items-center gap-2">
          {meal.meal_type && (
            <span className={`px-2 py-0.5 rounded text-xs ${
              meal.meal_type === 'main' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 
              meal.meal_type === 'periworkout' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300' : 
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>{meal.meal_type}</span>
          )}
          {meal.meal_time && <span className="text-sm text-gray-500 dark:text-gray-400">{meal.meal_time}</span>}
        </div>
      </div>
      
      {/* Selected Nutrients Badges */}
      {selectedNutrients.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedNutrients.map((nutrientKey) => {
            const nutrient = AVAILABLE_NUTRIENTS.find((n) => n.key === nutrientKey)
            if (!nutrient) return null
            const category = NUTRIENT_CONFIG.find(n => n.key === nutrientKey)?.category
            
            return (
              <span
                key={nutrientKey}
                className={`px-2 py-0.5 rounded text-xs ${getCategoryClasses(category, false)}`}
              >
                {nutrient.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Ingredients Table */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {meal.ingredients && meal.ingredients.length > 0 ? (
          <div className="space-y-1">
            {/* Table header */}
            {selectedNutrients.length > 0 && (
              <div className="flex gap-2 pb-2 border-b border-gray-300 dark:border-gray-600 font-semibold text-xs">
                <div className="flex-1 min-w-0">Ingrediente</div>
                <div className="w-20 text-right">Cantidad</div>
                {selectedNutrients.map((nutrientKey) => {
                  const nutrient = AVAILABLE_NUTRIENTS.find((n) => n.key === nutrientKey)
                  return (
                    <div key={nutrientKey} className="w-20 text-right" title={nutrient?.label}>
                      {nutrient?.label}
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Table rows */}
            {meal.ingredients.map((ing: any, i: number) => (
              <div key={i} className="flex gap-2 items-center py-1">
                <div className="flex-1 min-w-0 truncate" title={ing.food_name}>
                  {ing.food_name}
                </div>
                <div className="w-20 text-right text-gray-700 dark:text-gray-300">
                  {(ing.weight_g !== undefined && ing.weight_g !== null) 
                    ? `${ing.weight_g.toFixed(0)}g` 
                    : '-'}
                </div>
                {selectedNutrients.map((nutrientKey) => {
                  const nutrient = AVAILABLE_NUTRIENTS.find((n) => n.key === nutrientKey)
                  const value = ing.nutritional_contribution?.[nutrientKey]
                  const hasValue = value !== null && value !== undefined && value !== ''
                  const displayValue = hasValue
                    ? typeof value === 'number' && value < 1 && value > 0
                      ? value.toFixed(2)
                      : typeof value === 'number'
                        ? value.toFixed(1)
                        : String(value)
                    : '-'
                  
                  return (
                    <div 
                      key={nutrientKey} 
                      className={`w-20 text-right font-medium ${
                        displayValue !== '-' ? getColorClasses(nutrient?.color || 'gray', false).split(' ')[1] : 'text-gray-400'
                      }`}
                      title={`${nutrient?.label}: ${displayValue} ${nutrient?.unit}`}
                    >
                      {displayValue}
                    </div>
                  )
                })}
              </div>
            ))}
            
            {/* Totals row */}
            {selectedNutrients.length > 0 && meal.totals && (
              <div className="flex gap-2 items-center pt-2 mt-2 border-t border-gray-300 dark:border-gray-600 font-bold">
                <div className="flex-1 min-w-0 text-gray-900 dark:text-white">
                  Total
                </div>
                <div className="w-20 text-right">
                  {/* Empty space for quantity column */}
                </div>
                {selectedNutrients.map((nutrientKey) => {
                  const nutrient = AVAILABLE_NUTRIENTS.find((n) => n.key === nutrientKey)
                  const value = meal.totals[nutrientKey]
                  const hasValue = value !== null && value !== undefined && value !== ''
                  const displayValue = hasValue
                    ? typeof value === 'number' && value < 1 && value > 0
                      ? value.toFixed(2)
                      : typeof value === 'number'
                        ? value.toFixed(1)
                        : String(value)
                    : '-'
                  
                  return (
                    <div 
                      key={nutrientKey} 
                      className={`w-20 text-right font-bold ${
                        displayValue !== '-' ? getColorClasses(nutrient?.color || 'gray', false).split(' ')[1] : 'text-gray-400'
                      }`}
                      title={`Total ${nutrient?.label}: ${displayValue} ${nutrient?.unit}`}
                    >
                      {displayValue}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">No hay ingredientes registrados</div>
        )}
      </div>

      {/* Compliance Chart */}
      {slotCompliance && complianceChartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
          <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Cumplimiento nutricional del plato
          </h5>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={complianceChartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                <XAxis
                  dataKey="nutrient"
                  interval={0}
                  angle={-40}
                  textAnchor="end"
                  height={40}
                  tick={{ fontSize: 11, dy: 12 }}
                />
                <YAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(scaled: number) => {
                    const s = Number(scaled)
                    const threshold = SCALE_BELOW * 100
                    if (s <= threshold) {
                      const orig = s / SCALE_BELOW
                      return `${Math.round(orig)}%`
                    }
                    if (chartMaxRaw === 100) return '100%'
                    const above = (s - threshold) / (SCALE_ABOVE * 100)
                    const orig = 100 + above * (chartMaxRaw - 100)
                    return `${Math.round(orig)}%`
                  }}
                />
                <Tooltip content={<ComplianceTooltip />} />
                <ReferenceLine
                  y={SCALE_BELOW * 100}
                  stroke="#6b7280"
                  strokeDasharray="3 3"
                />
                <Bar dataKey="scaled" radius={[4, 4, 0, 0]}>
                  {complianceChartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={CATEGORY_COLORS[entry.category] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Cumplimiento general del plato:{' '}
              <span className={`font-bold ${
                slotCompliance.overall >= 90 ? 'text-green-600 dark:text-green-400' :
                slotCompliance.overall >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {slotCompliance.overall.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
