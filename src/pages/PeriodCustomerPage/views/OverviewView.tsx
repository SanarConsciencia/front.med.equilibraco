import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface OverviewViewProps {
  complianceData: BulkComplianceResponse
}

export const OverviewView: React.FC<OverviewViewProps> = ({ complianceData }) => {
  const customer = complianceData.customer_info
  const period = complianceData.period
  const analysis = complianceData.period_summary.analysis
  const avgCompliance = typeof analysis.average_compliance === 'number' ? analysis.average_compliance : null
  const daysAnalyzed = analysis.days_analyzed ?? 0
  const avgDii = analysis.inflammatory_summary?.average_dii ?? null
  const uniqueFoods = analysis.nutrient_variety?.unique_foods_count ?? 0
  const successful = complianceData.successful_days ?? 0
  const failed = complianceData.failed_days ?? 0
  const errors = complianceData.errors ?? []

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumen General</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer */}
        <div className="bg-white/50 dark:bg-gray-800 border rounded p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Paciente</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{customer.customer_full_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.customer_email}</p>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <div>UUID: <span className="font-medium">{customer.customer_uuid}</span></div>
            <div>Subscripción: <span className={`font-medium ${customer.has_active_subscription ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{customer.has_active_subscription ? 'Activa' : 'Inactiva'}</span></div>
          </div>
        </div>

        {/* Period */}
        <div className="bg-white/50 dark:bg-gray-800 border rounded p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Período</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{period.start_date} → {period.end_date}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Días en período: <span className="font-medium">{period.total_days}</span></p>
          <div className="mt-3 flex space-x-3 text-sm">
            <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
              <div className="text-xs text-gray-500">Procesados</div>
              <div className="font-semibold text-green-700 dark:text-green-300">{successful}</div>
            </div>
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800">
              <div className="text-xs text-gray-500">Errores</div>
              <div className="font-semibold text-red-700 dark:text-red-300">{failed}</div>
            </div>
          </div>
        </div>

        {/* Analysis snapshot */}
        <div className="bg-white/50 dark:bg-gray-800 border rounded p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Análisis</p>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-xs text-gray-500">Compliance</div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">{avgCompliance !== null ? `${avgCompliance.toFixed(1)}%` : 'N/A'}</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-xs text-gray-500">DII Promedio</div>
              <div className="font-semibold text-purple-600 dark:text-purple-400">{avgDii !== null ? avgDii.toFixed(2) : 'N/A'}</div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
              <div className="text-xs text-gray-500">Alimentos únicos</div>
              <div className="font-semibold text-orange-600 dark:text-orange-400">{uniqueFoods}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-xs text-gray-500">Días analizados</div>
              <div className="font-semibold text-gray-900 dark:text-white">{daysAnalyzed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Errors (if any) */}
      {errors.length > 0 && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-red-700 dark:text-red-300">Errores por día ({errors.length})</div>
            <button className="text-xs text-gray-600 dark:text-gray-300">Ver todos</button>
          </div>

          <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {errors.slice(0, 5).map((err, i) => (
              <li key={i} className="flex items-start justify-between">
                <span>{err.day_id}: {err.error}</span>
                <span className="text-xs text-gray-500">detalles</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}
