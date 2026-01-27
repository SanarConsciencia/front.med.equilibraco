import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface OverviewViewProps {
  complianceData: BulkComplianceResponse
}

export const OverviewView: React.FC<OverviewViewProps> = ({ complianceData }) => {
  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumen General</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Promedio</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{complianceData.period_summary.analysis.average_compliance.toFixed(1)}%</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-100 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Días Analizados</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{complianceData.period_summary.analysis.days_with_data}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded border border-purple-100 dark:border-purple-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">DII Promedio</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{complianceData.period_summary.analysis.inflammatory_summary.average_dii.toFixed(2)}</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded border border-orange-100 dark:border-orange-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Alimentos Únicos</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{complianceData.period_summary.analysis.nutrient_variety.unique_foods_count}</p>
        </div>
      </div>
    </div>
  )
}
