import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts'

interface ChartProps {
  boxplotData: any[]
  chartMinValue: number
  chartMaxValue: number
  getStatusColor: (s: string) => string
  CustomTooltip: React.ComponentType<any>
  selectedCategory: 'all' | 'low' | 'high' | 'optimal' | 'variable'
  setSelectedCategory: (category: 'all' | 'low' | 'high' | 'optimal' | 'variable') => void
  allBoxplotData: any[]
  lowNutrients: string[]
  highNutrients: string[]
  optimalNutrients: string[]
}

export const PeriodNutrientTrendsChart: React.FC<ChartProps> = ({
  boxplotData,
  chartMinValue,
  chartMaxValue,
  getStatusColor,
  CustomTooltip,
  selectedCategory,
  setSelectedCategory,
  allBoxplotData,
  lowNutrients,
  highNutrients,
  optimalNutrients,
}) => {
  const renderBoxplot = (props: any) => {
    const { x, y, width, height, payload } = props
    if (!payload) return null

    const boxWidth = 30
    const centerX = x + width / 2
    const color = getStatusColor(payload.status)

    // Función para calcular la posición Y en el gráfico
    // y es la coordenada superior del área de ploteo (representa chartMaxValue)
    // y + height es la coordenada inferior (representa chartMinValue)
    const scaleY = (value: number) => {
      // Clipear el valor al rango del gráfico
      const clippedValue = Math.max(chartMinValue, Math.min(chartMaxValue, value))
      // Calcular la posición Y proporcional
      const ratio = (clippedValue - chartMinValue) / (chartMaxValue - chartMinValue)
      return y + height * (1 - ratio)
    }

    const minY = scaleY(payload.min)
    const q1Y = scaleY(payload.q1)
    const medianY = scaleY(payload.median)
    const q3Y = scaleY(payload.q3)
    const maxY = scaleY(payload.max)
    const avgY = scaleY(payload.average)

    return (
      <g>
        {/* Whisker inferior: línea de min a Q1 */}
        <line
          x1={centerX}
          y1={minY}
          x2={centerX}
          y2={q1Y}
          stroke="#6B7280"
          strokeWidth={1.5}
        />
        {/* Tapa inferior */}
        <line
          x1={centerX - 8}
          y1={minY}
          x2={centerX + 8}
          y2={minY}
          stroke="#6B7280"
          strokeWidth={1.5}
        />

        {/* Caja (Q1 a Q3) */}
        <rect
          x={centerX - boxWidth / 2}
          y={q3Y}
          width={boxWidth}
          height={Math.max(0, q1Y - q3Y)}
          fill={color}
          fillOpacity={0.6}
          stroke={color}
          strokeWidth={2}
          rx={3}
        />

        {/* Línea de mediana */}
        <line
          x1={centerX - boxWidth / 2}
          y1={medianY}
          x2={centerX + boxWidth / 2}
          y2={medianY}
          stroke="#1F2937"
          strokeWidth={2.5}
        />

        {/* Whisker superior: línea de Q3 a max */}
        <line
          x1={centerX}
          y1={q3Y}
          x2={centerX}
          y2={maxY}
          stroke="#6B7280"
          strokeWidth={1.5}
        />
        {/* Tapa superior */}
        <line
          x1={centerX - 8}
          y1={maxY}
          x2={centerX + 8}
          y2={maxY}
          stroke="#6B7280"
          strokeWidth={1.5}
        />

        {/* Promedio como línea horizontal más gruesa */}
        <line
          x1={centerX - boxWidth / 2 - 3}
          y1={avgY}
          x2={centerX + boxWidth / 2 + 3}
          y2={avgY}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    )
  }

  // Legend payload (colors must match getStatusColor for clarity)
  const legendPayload = [
    { value: 'Bajo/Deficiente', color: '#EF4444' },
    { value: 'Alto/Exceso', color: '#F97316' },
    { value: 'Variable', color: '#F59E0B' },
    { value: 'Óptimo', color: '#10B981' },
  ]

  const LegendContent = (props: any) => {
    const { payload } = props
    const items = payload || legendPayload
    return (
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Estados</p>
        <div className="flex flex-row gap-2 text-xs">
          {items.map((entry: any) => (
            <div key={entry.value} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: entry.color }} />
              <span className="text-gray-600 dark:text-gray-400">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Todos ({allBoxplotData.length})
          </button>
          <button
            onClick={() => setSelectedCategory('low')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'low'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Deficientes ({lowNutrients.length})
          </button>
          <button
            onClick={() => setSelectedCategory('high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'high'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Excesivos ({highNutrients.length})
          </button>
          <button
            onClick={() => setSelectedCategory('optimal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'optimal'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Óptimos ({optimalNutrients.length})
          </button>
          <button
            onClick={() => setSelectedCategory('variable')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'variable'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Variables ({allBoxplotData.filter(item => item.status.toLowerCase().includes('variable')).length})
          </button>
        </div>
      </div>

      {/* Gráfico de distribución */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Leyenda */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Leyenda del boxplot</p>
              <div className="space-y-0 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg width="20" height="16" className="flex-shrink-0">
                    <line x1="10" y1="0" x2="10" y2="16" stroke="#6B7280" strokeWidth="1.5" />
                    <line x1="5" y1="0" x2="15" y2="0" stroke="#6B7280" strokeWidth="1.5" />
                  </svg>
                  <span>Máximo</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="16" className="flex-shrink-0">
                    <rect x="5" y="2" width="10" height="12" fill="#F59E0B" fillOpacity="0.6" stroke="#F59E0B" strokeWidth="2" rx="2" />
                  </svg>
                  <span>Caja (Q1 a Q3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="16" className="flex-shrink-0">
                    <line x1="5" y1="8" x2="15" y2="8" stroke="#1F2937" strokeWidth="2.5" />
                  </svg>
                  <span>Mediana</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="16" className="flex-shrink-0">
                    <line x1="3" y1="8" x2="17" y2="8" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>Promedio</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="16" className="flex-shrink-0">
                    <line x1="10" y1="0" x2="10" y2="16" stroke="#6B7280" strokeWidth="1.5" />
                    <line x1="5" y1="16" x2="15" y2="16" stroke="#6B7280" strokeWidth="1.5" />
                  </svg>
                  <span>Mínimo</span>
                </div>
              </div>

              {/* Legend moved into Recharts - see chart legend */}
            </div>
          </div>

          {/* Header del gráfico */}
          <div className="flex-1 min-w-0 ">
            <div className="mb-4 ">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Distribución de compliance</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Los boxplots muestran la distribución completa de cada nutriente. Rango: 0-200%
              </p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart 
            data={boxplotData} 
            margin={{ top: 20, right: 30, left: 50, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            
            <XAxis 
              type="category" 
              dataKey="nutrient" 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF', fontSize: 12, dy: 15 }} 
              tickSize={10}
              angle={-65} 
              textAnchor="end" 
              height={80} 
            />
            
            <YAxis
              type="number"
              domain={[chartMinValue, chartMaxValue]}
              ticks={[0, 50, 100, 150, 200]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              label={{ value: 'Compliance (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              tickFormatter={(value: number) => `${value}%`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend content={() => <LegendContent payload={legendPayload} />} align="left" verticalAlign="bottom" layout='horizontal' />

            {/* Líneas de referencia */}
            <ReferenceLine 
              y={75} 
              stroke="#EF4444" 
              strokeDasharray="5 5" 
              label={{ value: '75%', fill: '#EF4444', fontSize: 10, position: 'right' }} 
            />
            <ReferenceLine 
              y={100} 
              stroke="#10B981" 
              strokeWidth={2} 
              label={{ value: '100%', fill: '#10B981', fontSize: 11, fontWeight: 'bold', position: 'right' }} 
            />
            <ReferenceLine 
              y={125} 
              stroke="#F97316" 
              strokeDasharray="5 5" 
              label={{ value: '125%', fill: '#F97316', fontSize: 10, position: 'right' }} 
            />

            {/* Barra invisible con valor de referencia fijo que usa el shape personalizado */}
            <Bar 
              dataKey="_chartRef" 
              shape={renderBoxplot} 
              fill="transparent" 
              isAnimationActive={false} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}