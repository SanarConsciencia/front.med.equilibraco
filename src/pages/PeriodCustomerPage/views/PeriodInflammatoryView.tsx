import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodInflammatoryViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodInflammatoryView: React.FC<PeriodInflammatoryViewProps> = ({ complianceData }) => {
  const inflammatory = complianceData.period_summary.analysis.inflammatory_summary
  const chartData = inflammatory.chart_data ?? []
  const recommendation = inflammatory.recommendation ?? ''

  const getClassificationColor = (classification: string) => {
    const lower = (classification || '').toLowerCase()
    if (lower.includes('anti')) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    if (lower.includes('pro')) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
  }

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análisis Inflamatorio del Período</h2>
        <div className="flex items-center mt-2 space-x-3">
          <span className={`text-lg font-bold px-4 py-1 rounded ${getClassificationColor(inflammatory.classification)}`}>
            {inflammatory.classification}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            DII Promedio: <span className="font-semibold text-orange-600 dark:text-orange-400">
              {inflammatory.average_dii.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Días Analizados</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{inflammatory.days_analyzed}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {inflammatory.days_with_complete_data} completos
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Anti-inflamatorios</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{inflammatory.anti_inflammatory_days}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((inflammatory.anti_inflammatory_days / inflammatory.days_analyzed) * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pro-inflamatorios</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inflammatory.pro_inflammatory_days}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((inflammatory.pro_inflammatory_days / inflammatory.days_analyzed) * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Neutrales</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{inflammatory.neutral_days}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((inflammatory.neutral_days / inflammatory.days_analyzed) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* DII Range */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Rango DII</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mínimo</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{inflammatory.min_dii.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Promedio</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{inflammatory.average_dii.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Máximo</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{inflammatory.max_dii.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">📈</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tendencia</h3>
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">{inflammatory.trend}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{inflammatory.trend_description}</p>
          </div>
        </div>
      </div>

      {/* DII Trend Chart */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📊 Evolución del Índice Inflamatorio (DII)</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'DII Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
                }}
                formatter={(value: any, name: string | undefined) => {
                  if (name === 'dii') {
                    return [typeof value === 'number' ? value.toFixed(2) : 'N/A', 'DII']
                  }
                  return [value, name || 'Valor']
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <ReferenceLine y={-1} stroke="#10B981" strokeDasharray="5 5" label={{ value: 'Anti-inflam', fill: '#10B981', fontSize: 10 }} />
              <ReferenceLine y={1} stroke="#EF4444" strokeDasharray="5 5" label={{ value: 'Pro-inflam', fill: '#EF4444', fontSize: 10 }} />
              <ReferenceLine y={inflammatory.average_dii} stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'Promedio', fill: '#F59E0B', fontSize: 10, position: 'right' }} />
              <Area
                type="monotone"
                dataKey="dii"
                fill="#8B5CF6"
                fillOpacity={0.1}
                stroke="none"
              />
              <Line 
                type="monotone" 
                dataKey="dii" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 5 }}
                activeDot={{ r: 7, fill: '#A78BFA' }}
                name="DII Score"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            No hay datos de gráfico disponibles
          </div>
        )}
      </div>

      {/* DII Chart Data Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">📋 Detalle por Día</h3>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">DII</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Clasificación</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {chartData.length > 0 ? (
                chartData.map((point, idx) => (
                  <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{point.date ?? '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-sm font-semibold ${
                        typeof point.dii === 'number' ? (point.dii < -1 ? 'text-green-600 dark:text-green-400' :
                        point.dii > 1 ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400') : 'text-gray-500'
                      }`}>
                        {typeof point.dii === 'number' ? point.dii.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${getClassificationColor(point.classification ?? '')}`}>
                        {point.classification ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {point.is_projected ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">Proyectado</span>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Completo</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">No hay datos</td>
                </tr>
              )}
            </tbody> 
          </table>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recomendación</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                {recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
