import React from 'react'

interface NutrientSelectorProps {
  selectedNutrients: string[]
  onToggleNutrient: (key: string) => void
  maxSelection: number
  groupedNutrients: Record<string, Array<any>>
  MACRO_KEYS: string[]
  AVAILABLE_NUTRIENTS: Array<any>
  NUTRIENT_CONFIG: Array<any>
  ADDITIONAL_NUTRIENTS: any
  getCategoryClasses: (category: string | undefined, isSelected: boolean) => string
}

export const NutrientSelector: React.FC<NutrientSelectorProps> = ({
  selectedNutrients,
  onToggleNutrient,
  maxSelection,
  groupedNutrients,
  MACRO_KEYS,
  AVAILABLE_NUTRIENTS,
  NUTRIENT_CONFIG,
  ADDITIONAL_NUTRIENTS,
  getCategoryClasses,
}) => {
  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        {/* Row 1: Macros (compact) */}
        <div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Macros</div>
          <div className="flex gap-1.5 flex-wrap">
            {MACRO_KEYS.map((key) => {
              const nutrient = AVAILABLE_NUTRIENTS.find(n => n.key === key)
              const category = NUTRIENT_CONFIG.find(n => n.key === key)?.category
              const isSelected = selectedNutrients.includes(key)
              const isDisabled = !isSelected && selectedNutrients.length >= maxSelection
              return (
                <button
                  key={key}
                  onClick={() => !isDisabled && onToggleNutrient(key)}
                  disabled={isDisabled}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${getCategoryClasses(category, isSelected)} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {nutrient?.label} {isSelected && '✓'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Row 2: Vitamins | Minerals | Caffeine | Others */}
        {/* Use 2 columns on very small screens, 4 equal columns on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Vitaminas</div>
            <div className="flex gap-1.5 flex-wrap items-start">
              {(groupedNutrients.vitamin || []).map((nutrient: any) => {
                const isSelected = selectedNutrients.includes(nutrient.key)
                const isDisabled = !isSelected && selectedNutrients.length >= maxSelection
                return (
                  <button
                    key={nutrient.key}
                    onClick={() => !isDisabled && onToggleNutrient(nutrient.key)}
                    disabled={isDisabled}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${getCategoryClasses('vitamin', isSelected)} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {nutrient.label} {isSelected && '✓'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Minerales</div>
            <div className="flex gap-1.5 flex-wrap items-start">
              {(groupedNutrients.mineral || []).map((nutrient: any) => {
                const isSelected = selectedNutrients.includes(nutrient.key)
                const isDisabled = !isSelected && selectedNutrients.length >= maxSelection
                return (
                  <button
                    key={nutrient.key}
                    onClick={() => !isDisabled && onToggleNutrient(nutrient.key)}
                    disabled={isDisabled}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${getCategoryClasses('mineral', isSelected)} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {nutrient.label} {isSelected && '✓'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cafeína</div>
            <div className="flex gap-1.5 flex-wrap items-start justify-start">
              {ADDITIONAL_NUTRIENTS.caffeine.map((nutrient: any) => {
                const isSelected = selectedNutrients.includes(nutrient.key)
                const isDisabled = !isSelected && selectedNutrients.length >= maxSelection
                return (
                  <button
                    key={nutrient.key}
                    onClick={() => !isDisabled && onToggleNutrient(nutrient.key)}
                    disabled={isDisabled}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${getCategoryClasses('vitamin', isSelected)} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {nutrient.label} {isSelected && '✓'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Otros</div>
            <div className="flex gap-1.5 flex-wrap items-start">
              {ADDITIONAL_NUTRIENTS.fats_alcohol.map((nutrient: any) => {
                const isSelected = selectedNutrients.includes(nutrient.key)
                const isDisabled = !isSelected && selectedNutrients.length >= maxSelection
                return (
                  <button
                    key={nutrient.key}
                    onClick={() => !isDisabled && onToggleNutrient(nutrient.key)}
                    disabled={isDisabled}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${getCategoryClasses('fat', isSelected)} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {nutrient.label} {isSelected && '✓'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Bioactivos (compact) */}
        <div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bioactivos</div>
          <div className="flex gap-1.5 flex-wrap">
            {ADDITIONAL_NUTRIENTS.bioactives.map((nutrient: any) => {
              const isSelected = selectedNutrients.includes(nutrient.key)
              const isDisabled = !isSelected && selectedNutrients.length >= maxSelection
              return (
                <button
                  key={nutrient.key}
                  onClick={() => !isDisabled && onToggleNutrient(nutrient.key)}
                  disabled={isDisabled}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${getCategoryClasses('protein', isSelected)} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {nutrient.label} {isSelected && '✓'}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
