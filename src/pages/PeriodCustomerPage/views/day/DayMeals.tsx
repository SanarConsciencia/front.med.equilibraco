import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DayAnalysisResponse } from '../../../../types/medicalApiTypes'
import { NutrientSelector } from './NutrientSelector'
import { MealCard } from './MealCard'

// Available nutrients with labels
const AVAILABLE_NUTRIENTS = [
  { key: 'proteins_g', label: 'Proteínas', unit: 'g', color: 'violet' },
  { key: 'carbs_g', label: 'Carbos', unit: 'g', color: 'blue' },
  { key: 'fats_g', label: 'Grasas', unit: 'g', color: 'amber' },
  { key: 'fiber_g', label: 'Fibra', unit: 'g', color: 'green' },
  { key: 'sugars_g', label: 'Azúcares', unit: 'g', color: 'orange' },
  { key: 'starches_g', label: 'Almidón', unit: 'g', color: 'yellow' },
  { key: 'fiber_soluble_g', label: 'F. Soluble', unit: 'g', color: 'emerald' },
  { key: 'fiber_insoluble_g', label: 'F. Insoluble', unit: 'g', color: 'teal' },
  { key: 'sfa_g', label: 'Saturadas', unit: 'g', color: 'red' },
  { key: 'mufa_g', label: 'MUFA', unit: 'g', color: 'orange' },
  { key: 'pufa_g', label: 'PUFA', unit: 'g', color: 'lime' },
  { key: 'omega_3_epa_dha_mg', label: 'Ω-3 EPA/DHA', unit: 'mg', color: 'cyan' },
  { key: 'omega_3_ala_g', label: 'Ω-3 ALA', unit: 'g', color: 'sky' },
  { key: 'omega_6_la_g', label: 'Ω-6 LA', unit: 'g', color: 'indigo' },
  { key: 'calcium', label: 'Calcio', unit: 'mg', color: 'pink' },
  { key: 'iron', label: 'Hierro', unit: 'mg', color: 'rose' },
  { key: 'magnesium', label: 'Magnesio', unit: 'mg', color: 'purple' },
  { key: 'zinc', label: 'Zinc', unit: 'mg', color: 'fuchsia' },
  { key: 'potassium', label: 'Potasio', unit: 'mg', color: 'violet' },
  { key: 'sodium', label: 'Sodio', unit: 'mg', color: 'slate' },
  { key: 'folate', label: 'Folato', unit: 'μg', color: 'green' },
  { key: 'vitamin_b1', label: 'B1', unit: 'mg', color: 'yellow' },
  { key: 'vitamin_b2', label: 'B2', unit: 'mg', color: 'amber' },
  { key: 'vitamin_b6', label: 'B6', unit: 'mg', color: 'orange' },
  { key: 'vitamin_b12', label: 'B12', unit: 'μg', color: 'red' },
  { key: 'vitamin_c', label: 'Vit C', unit: 'mg', color: 'lime' },
  { key: 'vitamin_d', label: 'Vit D', unit: 'μg', color: 'cyan' },
  { key: 'vitamin_a', label: 'Vit A', unit: 'μg', color: 'rose' },
  { key: 'vitamin_e', label: 'Vit E', unit: 'mg', color: 'emerald' },
  { key: 'selenium', label: 'Selenio', unit: 'μg', color: 'gray' },
  { key: 'cholesterol_mg', label: 'Colesterol', unit: 'mg', color: 'red' },
  { key: 'trans_fats_g', label: 'Trans', unit: 'g', color: 'red' },
  { key: 'alcohol_g', label: 'Alcohol', unit: 'g', color: 'purple' },
  { key: 'caffeine_mg', label: 'Cafeína', unit: 'mg', color: 'brown' },
  { key: 'beta_carotene_mcg', label: 'β-Caroteno', unit: 'μg', color: 'orange' },
  { key: 'anthocyanidins_mg', label: 'Antocianinas', unit: 'mg', color: 'purple' },
  { key: 'flavan3ols_mg', label: 'Flavan-3-oles', unit: 'mg', color: 'green' },
  { key: 'flavones_mg', label: 'Flavonas', unit: 'mg', color: 'yellow' },
  { key: 'flavonols_mg', label: 'Flavonoles', unit: 'mg', color: 'lime' },
  { key: 'flavanones_mg', label: 'Flavanonas', unit: 'mg', color: 'orange' },
  { key: 'isoflavones_mg', label: 'Isoflavonas', unit: 'mg', color: 'pink' },
  { key: 'tea_g', label: 'Té', unit: 'g', color: 'green' },
  { key: 'garlic_g', label: 'Ajo', unit: 'g', color: 'gray' },
  { key: 'ginger_g', label: 'Jengibre', unit: 'g', color: 'yellow' },
  { key: 'onion_g', label: 'Cebolla', unit: 'g', color: 'purple' },
  { key: 'turmeric_g', label: 'Cúrcuma', unit: 'g', color: 'yellow' },
  { key: 'pepper_g', label: 'Pimienta', unit: 'g', color: 'gray' },
  { key: 'thyme_g', label: 'Tomillo', unit: 'g', color: 'green' },
  { key: 'oregano_g', label: 'Orégano', unit: 'g', color: 'green' },
  { key: 'rosemary_g', label: 'Romero', unit: 'g', color: 'green' },
  { key: 'niacina', label: 'Niacina', unit: 'mg', color: 'blue' },
]

// Grouping configuration similar to ComplianceChart
const NUTRIENT_CONFIG = [
  // Proteínas
  { key: 'proteins_g', label: 'Proteínas', category: 'protein' },

  // Carbohidratos
  { key: 'carbs_g', label: 'Carbs', category: 'carb' },
  { key: 'starches_g', label: 'Almidón', category: 'carb' },
  { key: 'sugars_g', label: 'Azúcar', category: 'carb' },

  // Fibras
  { key: 'fiber_g', label: 'Fibra', category: 'fiber' },
  { key: 'fiber_soluble_g', label: 'Fibra soluble', category: 'fiber' },
  { key: 'fiber_insoluble_g', label: 'Fibra insoluble', category: 'fiber' },

  // Grasas (incluye trans y colesterol)
  { key: 'fats_g', label: 'Grasas', category: 'fat' },
  { key: 'sfa_g', label: 'Saturadas', category: 'fat' },
  { key: 'mufa_g', label: 'MUFA', category: 'fat' },
  { key: 'pufa_g', label: 'PUFA', category: 'fat' },
  { key: 'omega_3_epa_dha_mg', label: 'Ω-3 EPA/DHA', category: 'fat' },
  { key: 'omega_3_ala_g', label: 'Ω-3 ALA', category: 'fat' },
  { key: 'omega_6_la_g', label: 'Ω-6 LA', category: 'fat' },
  { key: 'trans_fats_g', label: 'Trans', category: 'fat' },
  { key: 'cholesterol_mg', label: 'Colesterol', category: 'fat' },

  // Minerales
  { key: 'calcium', label: 'Calcio', category: 'mineral' },
  { key: 'iron', label: 'Hierro', category: 'mineral' },
  { key: 'magnesium', label: 'Magnesio', category: 'mineral' },
  { key: 'zinc', label: 'Zinc', category: 'mineral' },
  { key: 'potassium', label: 'Potasio', category: 'mineral' },
  { key: 'sodium', label: 'Sodio', category: 'mineral' },

  // Vitaminas
  { key: 'folate', label: 'Folato', category: 'vitamin' },
  { key: 'vitamin_b1', label: 'B1', category: 'vitamin' },
  { key: 'vitamin_b12', label: 'B12', category: 'vitamin' },
  { key: 'vitamin_b2', label: 'B2', category: 'vitamin' },
  { key: 'vitamin_b6', label: 'B6', category: 'vitamin' },
  { key: 'vitamin_c', label: 'Vit C', category: 'vitamin' },
  { key: 'vitamin_d', label: 'Vit D', category: 'vitamin' },
]

// Additional groups (bioactives, fats_alcohol, caffeine)
const ADDITIONAL_NUTRIENTS = {
  fats_alcohol: [
    { key: 'trans_fats_g', label: 'Grasas trans', unit: 'g' },
    { key: 'cholesterol_mg', label: 'Colesterol', unit: 'mg' },
    { key: 'alcohol_g', label: 'Alcohol', unit: 'g' },
  ],
  caffeine: [
    { key: 'caffeine_mg', label: 'Cafeína', unit: 'mg' },
  ],
  bioactives: [
    { key: 'beta_carotene_mcg', label: 'β-Caroteno', unit: 'μg' },
    { key: 'anthocyanidins_mg', label: 'Antocianinas', unit: 'mg' },
    { key: 'flavan3ols_mg', label: 'Flavan-3-oles', unit: 'mg' },
    { key: 'flavones_mg', label: 'Flavonas', unit: 'mg' },
    { key: 'flavonols_mg', label: 'Flavonoles', unit: 'mg' },
    { key: 'flavanones_mg', label: 'Flavanonas', unit: 'mg' },
    { key: 'isoflavones_mg', label: 'Isoflavonas', unit: 'mg' },
    { key: 'tea_g', label: 'Té', unit: 'g' },
    { key: 'garlic_g', label: 'Ajo', unit: 'g' },
    { key: 'ginger_g', label: 'Jengibre', unit: 'g' },
    { key: 'onion_g', label: 'Cebolla', unit: 'g' },
    { key: 'turmeric_g', label: 'Cúrcuma', unit: 'g' },
    { key: 'pepper_g', label: 'Pimienta', unit: 'g' },
    { key: 'thyme_g', label: 'Tomillo', unit: 'g' },
    { key: 'oregano_g', label: 'Orégano', unit: 'g' },
    { key: 'rosemary_g', label: 'Romero', unit: 'g' },
  ],
}

// Category color classes (used for badges and selector)
const CATEGORY_COLORS: Record<string, { bg: string; text: string; hover: string; ring: string }> = {
  protein: { bg: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', hover: 'hover:bg-violet-200 dark:hover:bg-violet-900/40', ring: 'ring-violet-500' },
  carb: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/40', ring: 'ring-blue-500' },
  fiber: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', hover: 'hover:bg-green-200 dark:hover:bg-green-900/40', ring: 'ring-green-500' },
  fat: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/40', ring: 'ring-amber-500' },
  mineral: { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-300', hover: 'hover:bg-pink-200 dark:hover:bg-pink-900/40', ring: 'ring-pink-500' },
  vitamin: { bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-900/40', ring: 'ring-cyan-500' },
}

const getCategoryClasses = (category: string | undefined, isSelected: boolean) => {
  const c = CATEGORY_COLORS[category || 'protein'] || CATEGORY_COLORS.protein
  if (isSelected) return `${c.bg} ${c.text} ring-2 ring-offset-1 ${c.ring}`
  return `${c.bg} ${c.text} ${c.hover}`
}

// groupedNutrients is computed inside the component body to comply with React Hooks rules

interface DayMealsProps {
  dayData: DayAnalysisResponse
  customerFullName?: string
}

export const DayMeals: React.FC<DayMealsProps> = ({ dayData, customerFullName }) => {
  const [selectedNutrients, setSelectedNutrients] = useState<string[]>([])
  const [showNutrientSelector, setShowNutrientSelector] = useState(false)

  // Group nutrients by category for selector (useMemo inside component)
  const groupedNutrients = useMemo(() => {
    const groups: Record<string, Array<any>> = { protein: [], carb: [], fiber: [], fat: [], mineral: [], vitamin: [] }
    NUTRIENT_CONFIG.forEach((n) => {
      const meta = AVAILABLE_NUTRIENTS.find(a => a.key === n.key) || { unit: '', color: 'gray' }
      groups[n.category] = groups[n.category] || []
      groups[n.category].push({ ...n, unit: meta.unit, color: meta.color })
    })
    return groups
  }, [])

  // All macros (proteins, carbs details, fiber details, fats and related)
  const MACRO_KEYS = [
    'proteins_g',
    'carbs_g', 'starches_g', 'sugars_g',
    'fiber_g', 'fiber_soluble_g', 'fiber_insoluble_g',
    'fats_g', 'sfa_g', 'mufa_g', 'pufa_g', 'omega_3_epa_dha_mg', 'omega_3_ala_g', 'omega_6_la_g',
    'trans_fats_g', 'cholesterol_mg'
  ]

  const toggleNutrient = (nutrientKey: string) => {
    setSelectedNutrients((prev) => {
      if (prev.includes(nutrientKey)) {
        return prev.filter((k) => k !== nutrientKey)
      } else {
        if (prev.length >= 12) {
          return prev
        }
        return [...prev, nutrientKey]
      }
    })
  }

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      violet: { bg: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', hover: 'hover:bg-violet-200 dark:hover:bg-violet-900/40' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/40' },
      amber: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/40' },
      green: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', hover: 'hover:bg-green-200 dark:hover:bg-green-900/40' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', hover: 'hover:bg-orange-200 dark:hover:bg-orange-900/40' },
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/40' },
      emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/40' },
      teal: { bg: 'bg-teal-100 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', hover: 'hover:bg-teal-200 dark:hover:bg-teal-900/40' },
      red: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', hover: 'hover:bg-red-200 dark:hover:bg-red-900/40' },
      lime: { bg: 'bg-lime-100 dark:bg-lime-900/20', text: 'text-lime-700 dark:text-lime-300', hover: 'hover:bg-lime-200 dark:hover:bg-lime-900/40' },
      cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-900/40' },
      sky: { bg: 'bg-sky-100 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', hover: 'hover:bg-sky-200 dark:hover:bg-sky-900/40' },
      indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/40' },
      pink: { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-300', hover: 'hover:bg-pink-200 dark:hover:bg-pink-900/40' },
      rose: { bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', hover: 'hover:bg-rose-200 dark:hover:bg-rose-900/40' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/40' },
      fuchsia: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/20', text: 'text-fuchsia-700 dark:text-fuchsia-300', hover: 'hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/40' },
      slate: { bg: 'bg-slate-100 dark:bg-slate-900/20', text: 'text-slate-700 dark:text-slate-300', hover: 'hover:bg-slate-200 dark:hover:bg-slate-900/40' },
      gray: { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-700 dark:text-gray-300', hover: 'hover:bg-gray-200 dark:hover:bg-gray-900/40' },
      brown: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-800 dark:text-amber-400', hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/40' },
    }
    
    const colorClass = colors[color] || colors.gray
    
    if (isSelected) {
      return `${colorClass.bg} ${colorClass.text} ring-2 ring-offset-1 ring-${color}-500`
    }
    
    return `${colorClass.bg} ${colorClass.text} ${colorClass.hover}`
  }

  const sortedMeals = React.useMemo(() => {
    // Use contributions.by_meal which has nutritional data
    const mealsWithNutrition = dayData.contributions.by_meal ?? []
    const dayMeals = dayData.day.meals ?? []
    
    // Merge data: get meal metadata from day.meals and nutrition from contributions
    const mergedMeals = mealsWithNutrition.map((contributionMeal, idx) => {
      const dayMeal = dayMeals[idx] || {}
      return {
        ...contributionMeal,
        // Prefer canonical meal name from day.meals if available
        meal_name: dayMeal.meal_name ?? contributionMeal.meal_name,
        meal_type: dayMeal.meal_type,
        meal_time: dayMeal.meal_time,
        slot_id: dayMeal.slot_id,
      }
    })
    
    // Separate meals by type
    const mainMeals = mergedMeals.filter(meal => meal.meal_type === 'main')
    const periworkoutMeals = mergedMeals.filter(meal => meal.meal_type === 'periworkout')
    const extraMeals = mergedMeals.filter(meal => meal.meal_type !== 'main' && meal.meal_type !== 'periworkout')
    
    // Sort main meals by time
    const sortedMainMeals = mainMeals.sort((a, b) => {
      if (!a.meal_time && !b.meal_time) return 0
      if (!a.meal_time) return 1
      if (!b.meal_time) return -1
      
      // Convert time strings to comparable format (assuming HH:MM format)
      const timeA = a.meal_time.split(':').map(Number)
      const timeB = b.meal_time.split(':').map(Number)
      
      const minutesA = timeA[0] * 60 + timeA[1]
      const minutesB = timeB[0] * 60 + timeB[1]
      
      return minutesA - minutesB
    })
    
    // Combine in order: main (sorted by time), periworkout, extra
    return [...sortedMainMeals, ...periworkoutMeals, ...extraMeals]
  }, [dayData.contributions.by_meal, dayData.day.meals])

  return (
    <div className="w-full max-w-full bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Platos del día{dayData.day?.date ? ` ${format(new Date(dayData.day.date), "EEEE d 'de' MMMM yyyy", { locale: es })}` : ''}{customerFullName ? ` de ${customerFullName}` : ''}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Lista de comidas y sus ingredientes
        </p>
        
        {/* Nutrient Selector */}
        <div className="mt-3">
          <button
            onClick={() => setShowNutrientSelector(!showNutrientSelector)}
            className="text-xs px-3 py-1.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            {selectedNutrients.length === 0 
              ? '+ Seleccionar nutrientes para mostrar' 
              : `${selectedNutrients.length}/12 nutrientes seleccionados`}
          </button>
          
          {showNutrientSelector && (
            <NutrientSelector
              selectedNutrients={selectedNutrients}
              onToggleNutrient={toggleNutrient}
              maxSelection={12}
              groupedNutrients={groupedNutrients}
              MACRO_KEYS={MACRO_KEYS}
              AVAILABLE_NUTRIENTS={AVAILABLE_NUTRIENTS}
              NUTRIENT_CONFIG={NUTRIENT_CONFIG}
              ADDITIONAL_NUTRIENTS={ADDITIONAL_NUTRIENTS}
              getCategoryClasses={getCategoryClasses}
            />
          )}
        </div>
      </div>
      
      {/* Meals List */}
      <div className="space-y-4">
        {sortedMeals.map((meal, idx) => (
          <MealCard
            key={idx}
            meal={meal}
            selectedNutrients={selectedNutrients}
            AVAILABLE_NUTRIENTS={AVAILABLE_NUTRIENTS}
            NUTRIENT_CONFIG={NUTRIENT_CONFIG}
            getCategoryClasses={getCategoryClasses}
            getColorClasses={getColorClasses}
            complianceBySlot={dayData.compliance?.by_slot}
          />
        ))}
      </div>
    </div>
  )
}
