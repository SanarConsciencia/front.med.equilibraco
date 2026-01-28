import React, { useMemo, useState } from 'react'
import type { BulkComplianceResponse } from '../../../../types/medicalApiTypes'

interface PeriodIngredientConsumptionViewProps {
  complianceData: BulkComplianceResponse
}

// Purchase conversion factors by category
const PURCHASE_FACTORS: Record<string, { factor: number; unit: 'g' | 'kg' | 'unidades'; unitSize?: number; notes: string }> = {
  'Proteínas animales': { factor: 1.3, unit: 'g', notes: '30% pérdida en cocción' },
  'Huevos': { factor: 1.0, unit: 'unidades', unitSize: 50, notes: '~50g por huevo' },
  'Lácteos': { factor: 1.0, unit: 'g', notes: 'Sin pérdida' },
  'Vegetales': { factor: 1.3, unit: 'g', notes: '30% pérdida en limpieza' },
  'Frutas': { factor: 1.15, unit: 'g', notes: '15% pérdida (cáscara, semillas)' },
  'Legumbres': { factor: 0.33, unit: 'g', notes: 'Peso seco: 1/3 del cocido' },
  'Cereales': { factor: 0.33, unit: 'g', notes: 'Peso seco: 1/3 del cocido' },
  'Granos': { factor: 0.33, unit: 'g', notes: 'Peso seco: 1/3 del cocido' },
  'Aceites y mantequillas': { factor: 1.0, unit: 'g', notes: 'Sin pérdida' },
  'Grasas saludables': { factor: 1.0, unit: 'g', notes: 'Sin pérdida' },
  'Frutos secos y semillas': { factor: 1.0, unit: 'g', notes: 'Sin pérdida' },
  'Especias': { factor: 1.0, unit: 'g', notes: 'Sin pérdida' },
  'Preparaciones': { factor: 1.0, unit: 'g', notes: 'Ya preparado' },
  'Procesados': { factor: 1.0, unit: 'g', notes: 'Ya preparado' },
  'Otros': { factor: 1.0, unit: 'g', notes: 'Sin ajuste' },
}

// Calculate purchase amount based on consumed weight and category
const calculatePurchaseAmount = (consumedWeightKg: number, category: string) => {
  const categoryFactor = PURCHASE_FACTORS[category] || { factor: 1.0, unit: 'g' as const, notes: 'Sin ajuste' }
  const consumedWeightG = consumedWeightKg * 1000
  const purchaseWeightG = consumedWeightG * categoryFactor.factor

  if (categoryFactor.unit === 'unidades' && categoryFactor.unitSize) {
    const units = Math.ceil(purchaseWeightG / categoryFactor.unitSize)
    return { amount: units, unit: 'unidades', displayText: `${units} unidades`, notes: categoryFactor.notes }
  }

  if (purchaseWeightG >= 1000) {
    return { 
      amount: purchaseWeightG / 1000, 
      unit: 'kg', 
      displayText: `${(purchaseWeightG / 1000).toFixed(2)} kg`, 
      notes: categoryFactor.notes 
    }
  }

  return { 
    amount: purchaseWeightG, 
    unit: 'g', 
    displayText: `${Math.round(purchaseWeightG)} g`, 
    notes: categoryFactor.notes 
  }
}

export const PeriodIngredientConsumptionView: React.FC<PeriodIngredientConsumptionViewProps> = ({ complianceData }) => {
  const consumption = complianceData.period_summary.analysis.ingredient_consumption
  const totalIngredients = consumption?.total_ingredients ?? 0
  const totalWeightKg = typeof consumption?.total_weight_kg === 'number' ? consumption.total_weight_kg : 0
  const topIngredients = consumption?.top_50_ingredients ?? []
  const categoryTotals = consumption?.category_totals ?? {}
  const recommendation = consumption?.recommendation ?? ''
  const shoppingRecommendations = consumption?.shopping_recommendations ?? []
  const totalDays = complianceData.period?.total_days ?? 1

  // Group ingredients by usage intensity for strategic view
  const ingredientsByUsage = useMemo(() => {
    const staples: typeof topIngredients = []
    const regular: typeof topIngredients = []
    const occasional: typeof topIngredients = []
    
    topIngredients.forEach(ing => {
      const intensity = (ing.usage_intensity ?? '').toLowerCase()
      if (intensity.includes('muy frecuente') || intensity.includes('very frequent')) {
        staples.push(ing)
      } else if (intensity.includes('frecuente') || intensity.includes('frequent') || intensity.includes('moderado') || intensity.includes('moderate')) {
        regular.push(ing)
      } else {
        occasional.push(ing)
      }
    })
    
    return { staples, regular, occasional }
  }, [topIngredients])

  // Get category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Proteínas animales': 'bg-red-500',
      'Frutas': 'bg-orange-500',
      'Vegetales': 'bg-green-500',
      'Granos': 'bg-yellow-600',
      'Legumbres': 'bg-amber-700',
      'Lácteos': 'bg-blue-400',
      'Grasas saludables': 'bg-purple-500',
      'Preparaciones': 'bg-pink-500',
      'Procesados': 'bg-gray-500',
      'Especias': 'bg-teal-500',
      'Otros': 'bg-gray-400'
    }
    return colors[category] || 'bg-gray-500'
  }

  // Sort categories by weight
  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => (b.total_weight_kg ?? 0) - (a.total_weight_kg ?? 0))
  }, [categoryTotals])

  // State for table sorting
  const [sortColumn, setSortColumn] = useState<string>('frequency')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection(column === 'frequency' ? 'desc' : 'asc')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  // State for accordion expansion
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Sort ingredients based on current sort settings
  const sortedIngredients = useMemo(() => {
    return [...topIngredients].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortColumn) {
        case 'food_name':
          aValue = a.food_name?.toLowerCase() ?? ''
          bValue = b.food_name?.toLowerCase() ?? ''
          break
        case 'category':
          aValue = a.category?.toLowerCase() ?? ''
          bValue = b.category?.toLowerCase() ?? ''
          break
        case 'frequency':
          aValue = a.frequency ?? 0
          bValue = b.frequency ?? 0
          break
        case 'total_weight':
          aValue = a.total_weight_kg ?? 0
          bValue = b.total_weight_kg ?? 0
          break
        case 'avg_portion':
          aValue = a.avg_portion_g ?? 0
          bValue = b.avg_portion_g ?? 0
          break
        case 'purchase_weight':
          const aConsumedG = a.total_weight_g ?? (a.total_weight_kg ?? 0) * 1000
          const bConsumedG = b.total_weight_g ?? (b.total_weight_kg ?? 0) * 1000
          const aPurchase = calculatePurchaseAmount(aConsumedG / 1000, a.category ?? 'Otros')
          const bPurchase = calculatePurchaseAmount(bConsumedG / 1000, b.category ?? 'Otros')
          aValue = aPurchase.amount
          bValue = bPurchase.amount
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [topIngredients, sortColumn, sortDirection])

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🛒 Análisis de Carrito de Mercado</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Período de {totalDays} días • {totalIngredients} ingredientes únicos • {totalWeightKg.toFixed(2)} kg totales
        </p>
      </div>

      {/* Shopping Cart Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <span className="text-2xl mb-2 block">🛍️</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalIngredients}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ingredientes únicos</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <span className="text-2xl mb-2 block">⚖️</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalWeightKg.toFixed(1)}<span className="text-sm ml-1">kg</span></p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Peso total período</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <span className="text-2xl mb-2 block">📊</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{(totalWeightKg / (totalDays || 1)).toFixed(1)}<span className="text-sm ml-1">kg/día</span></p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Consumo promedio</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <span className="text-2xl mb-2 block">🔄</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{ingredientsByUsage.staples.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ingredientes básicos</p>
        </div>
      </div>

      {/* Recommendations - Make this prominent */}
      {(recommendation || shoppingRecommendations.length > 0) && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-2">Recomendaciones de Mercado</h3>
              {recommendation && (
                <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-3 font-medium">{recommendation}</p>
              )}
              {shoppingRecommendations.length > 0 && (
                <ul className="space-y-2">
                  {shoppingRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                      <span className="text-indigo-500 dark:text-indigo-400 mt-0.5">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Composition Visual */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Composición del Carrito por Categoría</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          {/* Visual bar showing all categories */}
          <div className="w-full h-8 flex rounded-lg overflow-hidden mb-4">
            {sortedCategories.map(([category, data]) => {
              const percentage = data.percentage ?? 0
              return (
                <div
                  key={category}
                  className={`${getCategoryColor(category)} transition-all hover:opacity-80`}
                  style={{ width: `${percentage}%` }}
                  title={`${category}: ${percentage.toFixed(1)}%`}
                />
              )
            })}
          </div>

          {/* Category breakdown with detailed ingredients */}
          <div className="space-y-2">
            {sortedCategories.map(([category, data]) => {
              const categoryIngredients = consumption?.by_category?.[category] ?? []
              const isExpanded = expandedCategories.has(category)
              return (
                <div key={category} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  {/* Category Header - Clickable */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded ${getCategoryColor(category)} flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-900 dark:text-white">{category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              {(data.percentage ?? 0).toFixed(1)}%
                            </span>
                            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {data.count} {data.count === 1 ? 'ingrediente' : 'ingredientes'}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {(data.total_weight_kg ?? 0).toFixed(2)} kg total
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Ingredients List - Expandable */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="space-y-2 pt-3">
                        {categoryIngredients
                          .sort((a, b) => (b.total_weight_kg ?? 0) - (a.total_weight_kg ?? 0))
                          .map((ing, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {ing.food_name}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-white dark:bg-gray-500 rounded px-2 py-1">
                                      <span className="text-gray-600 dark:text-gray-400">Frecuencia</span>
                                      <div className="font-semibold text-gray-900 dark:text-white">{ing.frequency}x</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-500 rounded px-2 py-1">
                                      <span className="text-gray-600 dark:text-gray-400">Peso total</span>
                                      <div className="font-semibold text-gray-900 dark:text-white">{(ing.total_weight_kg ?? 0).toFixed(2)} kg</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-500 rounded px-2 py-1">
                                      <span className="text-gray-600 dark:text-gray-400">Porción avg</span>
                                      <div className="font-semibold text-gray-900 dark:text-white">{(ing.avg_portion_g ?? 0).toFixed(0)}g</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>




      {/* Top 50 Ingredients Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Top 50 Ingredientes</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">#</th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('food_name')}
                  >
                    <div className="flex items-center gap-1">
                      Ingrediente
                      <span className="text-xs">{getSortIcon('food_name')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Categoría
                      <span className="text-xs">{getSortIcon('category')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('frequency')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Frecuencia
                      <span className="text-xs">{getSortIcon('frequency')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('total_weight')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Ingesta Total
                      <span className="text-xs">{getSortIcon('total_weight')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('purchase_weight')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Peso en bruto
                      <span className="text-xs">{getSortIcon('purchase_weight')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('avg_portion')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Porción Promedio
                      <span className="text-xs">{getSortIcon('avg_portion')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedIngredients.length > 0 ? sortedIngredients.map((ingredient, idx) => {
                  const totalWeightKg = ingredient.total_weight_kg ?? 0
                  const totalWeightG = ingredient.total_weight_g ?? 0
                  
                  // Use total_weight_g if available, otherwise convert from kg
                  const consumedG = totalWeightG > 0 ? totalWeightG : (totalWeightKg * 1000)
                  const displayWeight = consumedG >= 1000
                    ? `${(consumedG / 1000).toFixed(2)} kg`
                    : `${consumedG.toFixed(0)} g`

                  const purchaseAmount = calculatePurchaseAmount(consumedG / 1000, ingredient.category ?? 'Otros')

                  return (
                    <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{ingredient.food_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                        {ingredient.category}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                        {ingredient.frequency}x
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                        {displayWeight}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600 dark:text-blue-400" title={purchaseAmount.notes}>
                        {purchaseAmount.displayText}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                        {(ingredient.avg_portion_g ?? 0).toFixed(0)}g
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      No hay ingredientes disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
