import React from 'react'
import { Button } from '../../../components/ui'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface TopBarProps {
  complianceData: BulkComplianceResponse | null
  onBack: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ complianceData, onBack }) => {
  return (
    <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-gray-700 dark:text-gray-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Análisis Nutricional</h1>
        {complianceData && (
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {complianceData.customer_info.customer_full_name} | {complianceData.period.start_date} - {complianceData.period.end_date}
          </span>
        )}
      </div>
      <Button onClick={onBack} variant="secondary" className="text-xs">
        Volver
      </Button>
    </div>
  )
}
