import React from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface PeriodSummaryViewProps {
  complianceData: BulkComplianceResponse
}

export const PeriodSummaryView: React.FC<PeriodSummaryViewProps> = ({ complianceData }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumen del Periodo</h2>
      <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded text-xs overflow-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
        {JSON.stringify(complianceData.period_summary, null, 2)}
      </pre>
    </div>
  )
}
