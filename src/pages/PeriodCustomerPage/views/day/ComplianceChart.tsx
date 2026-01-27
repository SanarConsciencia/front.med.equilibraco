import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { DayAnalysisResponse, MealTotals, TotalRequirements } from '../../../../types/medicalApiTypes'

interface ComplianceChartProps {
  dayData: DayAnalysisResponse
  customerFullName?: string
}

// Nutrient display configuration
const NUTRIENT_CONFIG: Array<{
  key: keyof MealTotals
  label: string
  category: 'protein' | 'carb' | 'fiber' | 'fat' | 'mineral' | 'vitamin'
}> = [
  // 1. Proteínas
  { key: 'proteins_g', label: 'Proteínas', category: 'protein' },
  
  // 2. Carbs
  { key: 'carbs_g', label: 'Carbs', category: 'carb' },
  { key: 'starches_g', label: 'Almidón', category: 'carb' },
  { key: 'sugars_g', label: 'Azúcar', category: 'carb' },

  // 3. Fibras
  { key: 'fiber_g', label: 'Fibra', category: 'fiber' },
  { key: 'fiber_soluble_g', label: 'Fibra soluble', category: 'fiber' },
  { key: 'fiber_insoluble_g', label: 'Fibra insoluble', category: 'fiber' },

  // 4. Grasas
  { key: 'fats_g', label: 'Grasas', category: 'fat' },
  { key: 'sfa_g', label: 'Saturadas', category: 'fat' },
  { key: 'mufa_g', label: 'MUFA', category: 'fat' },
  { key: 'pufa_g', label: 'PUFA', category: 'fat' },
  { key: 'omega_3_epa_dha_mg', label: 'Ω-3 EPA/DHA', category: 'fat' },
  { key: 'omega_3_ala_g', label: 'Ω-3 ALA', category: 'fat' },
  { key: 'omega_6_la_g', label: 'Ω-6 LA', category: 'fat' },
  
  // 5. Minerales
  { key: 'calcium', label: 'Calcio', category: 'mineral' },
  { key: 'iron', label: 'Hierro', category: 'mineral' },
  { key: 'magnesium', label: 'Magnesio', category: 'mineral' },
  { key: 'zinc', label: 'Zinc', category: 'mineral' },
  { key: 'potassium', label: 'Potasio', category: 'mineral' },
  { key: 'sodium', label: 'Sodio', category: 'mineral' },
  
  // 6. Vitaminas
  { key: 'folate', label: 'Folato', category: 'vitamin' },
  { key: 'vitamin_b1', label: 'B1', category: 'vitamin' },
  { key: 'vitamin_b12', label: 'B12', category: 'vitamin' },
  { key: 'vitamin_b2', label: 'B2', category: 'vitamin' },
  { key: 'vitamin_b6', label: 'B6', category: 'vitamin' },
  { key: 'vitamin_c', label: 'Vit C', category: 'vitamin' },
  { key: 'vitamin_d', label: 'Vit D', category: 'vitamin' },
]

// Color palette for meals (stacks)
const MEAL_COLORS = [
  '#6366f1', // indigo-500
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#be185d', // pink-700
  '#0d9488', // teal-600
  '#c2410c', // orange-700
  '#dc2626', // red-600
  '#0891b2', // cyan-600
  '#65a30d', // lime-600
]

// Additional nutrients configuration (not shown in chart)
const ADDITIONAL_NUTRIENTS = {
  fats_alcohol: [
    { key: 'trans_fats_g' as keyof MealTotals, label: 'Grasas trans', unit: 'g' },
    { key: 'cholesterol_mg' as keyof MealTotals, label: 'Colesterol', unit: 'mg' },
    { key: 'alcohol_g' as keyof MealTotals, label: 'Alcohol', unit: 'g' },
  ],
  caffeine: [
    { key: 'caffeine_mg' as keyof MealTotals, label: 'Cafeína', unit: 'mg' },
  ],
  bioactives: [
    { key: 'beta_carotene_mcg' as keyof MealTotals, label: 'β-Caroteno', unit: 'mcg' },
    { key: 'anthocyanidins_mg' as keyof MealTotals, label: 'Antocianinas', unit: 'mg' },
    { key: 'flavan3ols_mg' as keyof MealTotals, label: 'Flavan-3-oles', unit: 'mg' },
    { key: 'flavones_mg' as keyof MealTotals, label: 'Flavonas', unit: 'mg' },
    { key: 'flavonols_mg' as keyof MealTotals, label: 'Flavonoles', unit: 'mg' },
    { key: 'flavanones_mg' as keyof MealTotals, label: 'Flavanonas', unit: 'mg' },
    { key: 'isoflavones_mg' as keyof MealTotals, label: 'Isoflavonas', unit: 'mg' },
    { key: 'tea_g' as keyof MealTotals, label: 'Té', unit: 'g' },
    { key: 'garlic_g' as keyof MealTotals, label: 'Ajo', unit: 'g' },
    { key: 'ginger_g' as keyof MealTotals, label: 'Jengibre', unit: 'g' },
    { key: 'onion_g' as keyof MealTotals, label: 'Cebolla', unit: 'g' },
    { key: 'turmeric_g' as keyof MealTotals, label: 'Cúrcuma', unit: 'g' },
    { key: 'pepper_g' as keyof MealTotals, label: 'Pimienta', unit: 'g' },
    { key: 'thyme_g' as keyof MealTotals, label: 'Tomillo', unit: 'g' },
    { key: 'oregano_g' as keyof MealTotals, label: 'Orégano', unit: 'g' },
    { key: 'rosemary_g' as keyof MealTotals, label: 'Romero', unit: 'g' },
  ],
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({ dayData, customerFullName }) => {
  const requirements = dayData.requirements.total
  const meals = dayData.contributions.by_meal

  // Map dataKey (contribution meal key) to display name from day.meals when available
  const displayNameByKey = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    const dayMeals = dayData.day.meals ?? []
    meals.forEach((meal, idx) => {
      const key = meal.meal_name
      map[key] = (dayMeals[idx] && dayMeals[idx].meal_name) ? dayMeals[idx].meal_name : key
    })
    return map
  }, [meals, dayData.day.meals])

  // State to track which meals are hidden (use dataKey values)
  const [hiddenMeals, setHiddenMeals] = useState<Set<string>>(new Set())

  const chartData = useMemo(() => {
    return NUTRIENT_CONFIG.map((nutrient) => {
      const requirement = requirements[nutrient.key as keyof TotalRequirements]
      
      // Skip if no requirement for this nutrient
      if (!requirement || requirement === 0) return null

      const dataPoint: any = {
        nutrient: nutrient.label,
        category: nutrient.category,
      }

      // Calculate percentage contribution of each meal for this nutrient
      meals.forEach((meal) => {
        const contribution = meal.totals[nutrient.key]
        if (contribution !== null && contribution !== undefined) {
          // % = (contribution / requirement) * 100
          const percentage = (contribution / requirement) * 100
          dataPoint[meal.meal_name] = Number(percentage.toFixed(1))
        } else {
          dataPoint[meal.meal_name] = 0
        }
      })

      return dataPoint
    }).filter((item) => item !== null)
  }, [dayData])

  // Get dataKeys for meals (these are the keys we stored in chart data)
  const mealKeys = useMemo(() => {
    return meals.map((meal) => meal.meal_name)
  }, [meals])

  // Calculate Y-axis max dynamically: at least 100, otherwise rounded up to next 10
  const yMax = useMemo(() => {
    if (!chartData || chartData.length === 0) return 100
    
    // Calculate the sum of all meal contributions for each nutrient (excluding hidden meals)
    const maxSum = Math.max(
      ...(chartData as any[]).map((dataPoint) =>
        mealKeys
          .filter(mealKey => !hiddenMeals.has(mealKey))
          .reduce((sum, mealKey) => sum + (dataPoint[mealKey] || 0), 0)
      ),
      100
    )
    
    return Math.ceil(maxSum / 10) * 10
  }, [chartData, mealKeys, hiddenMeals])

  // Handle legend click to toggle meal visibility
  const handleLegendClick = (e: any) => {
    const mealName = e.dataKey
    setHiddenMeals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(mealName)) {
        newSet.delete(mealName)
      } else {
        newSet.add(mealName)
      }
      return newSet
    })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    // Calculate total percentage
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0)

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {entry.name}:
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {entry.value}%
            </span>
          </div>
        ))}
        <div className="border-t border-gray-300 dark:border-gray-600 mt-2 pt-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-gray-900 dark:text-white">Total:</span>
            <span className={`${
              total >= 90 ? 'text-green-600 dark:text-green-400' :
              total >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {total.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cumplimiento nutricional del día {dayData.day?.date ? ` ${format(new Date(dayData.day.date), "EEEE d 'de' MMMM yyyy", { locale: es })}` : ''} {customerFullName ? ` de ${customerFullName}` : ''}{' '}
          
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Distribución del aporte de cada plato vs requerimientos totales (%)
        </p>
      </div>

      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
          <XAxis
            dataKey="nutrient"
            angle={-90}
            textAnchor="end"
            height={70}
            className="text-xs"
            tick={(props) => {
              const { x, y, payload } = props
              const dataPoint = chartData.find((d: any) => d.nutrient === payload.value)
              const category = dataPoint?.category || ''
              
              // Color by category
              const categoryColors: Record<string, string> = {
                protein: '#8b5cf6', // violet
                carb: '#3b82f6',    // blue
                fiber: '#10b981',   // green
                fat: '#f59e0b',     // amber
                mineral: '#ec4899', // pink
                vitamin: '#14b8a6', // teal
              }
              
              return (
                <text
                  x={Number(x) + 18}
                  y={Number(y) + 20}
                  textAnchor="end"
                  fill={categoryColors[category] || '#6b7280'}
                  fontSize={11}
                  fontWeight={category === 'protein' || category === 'carb' || category === 'fiber' || category === 'fat' ? 600 : 400}
                  transform={`rotate(-90, ${x}, ${Number(y) + 20})`}
                >
                  {payload.value}
                </text>
              )
            }}
          />
          <YAxis
            domain={[0, yMax]}
            label={{
              value: '% Cumplimiento',
              angle: -90,
              position: 'insideLeft',
              className: 'fill-gray-700 dark:fill-gray-300',
            }}
            className="fill-gray-700 dark:fill-gray-300"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={100}
            stroke="#6b7280"
            strokeDasharray="3 3"
            label={{
              value: '100%',
              position: 'right',
              fill: '#6b7280',
              fontSize: 12,
            }}
          />
          <Legend
            onClick={handleLegendClick}
            wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }}
            iconType="rect"
          />
          
          {/* Stacked bars - one for each meal */}
          {mealKeys.map((mealKey: string, index: number) => (
            <Bar
              key={mealKey}
              dataKey={mealKey}
              name={displayNameByKey[mealKey] || mealKey}
              stackId="a"
              fill={MEAL_COLORS[index % MEAL_COLORS.length]}
              hide={hiddenMeals.has(mealKey)}
              barSize={20}
              radius={index === mealKeys.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
          

        </BarChart>
      </ResponsiveContainer>
      </div>

      {/* Additional Nutrients Info Bar */}
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Otros nutrientes del día
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fats, Alcohol, Cholesterol */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
              Grasas Trans, Colesterol y Alcohol
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {ADDITIONAL_NUTRIENTS.fats_alcohol.map((nutrient) => {
                const value = dayData.contributions.total[nutrient.key]
                return (
                  <div key={nutrient.key} className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{nutrient.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {value !== null && value !== undefined ? value.toFixed(1) : '0'} {nutrient.unit}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Caffeine */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
              Cafeína
            </h5>
            <div className="grid grid-cols-1 place-items-center">
              {ADDITIONAL_NUTRIENTS.caffeine.map((nutrient) => {
                const value = dayData.contributions.total[nutrient.key]
                return (
                  <div key={nutrient.key} className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{nutrient.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {value !== null && value !== undefined ? value.toFixed(1) : '0'} {nutrient.unit}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bioactives */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
            Bioactivos (Carotenoides, Flavonoides y Especias)
          </h5>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {ADDITIONAL_NUTRIENTS.bioactives.map((nutrient) => {
              const value = dayData.contributions.total[nutrient.key]
              const hasValue = value !== null && value !== undefined && value > 0
              return (
                <div 
                  key={nutrient.key} 
                  className={`text-center p-1.5 rounded ${
                    hasValue 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={nutrient.label}>
                    {nutrient.label}
                  </p>
                  <p className={`text-sm font-bold ${
                    hasValue 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {hasValue ? value.toFixed(1) : '0'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{nutrient.unit}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
