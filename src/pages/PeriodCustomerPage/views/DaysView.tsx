import React, { useState } from 'react'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface DaysViewProps {
  complianceData: BulkComplianceResponse
}

export const DaysView: React.FC<DaysViewProps> = ({ complianceData }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Análisis por Día</h2>
      <div className="grid grid-cols-1 gap-2">
        {complianceData.days.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`p-3 border rounded text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
              selectedDay === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-gray-100">{day.day.date}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Compliance: {day.compliance.overall.toFixed(1)}%
              </span>
            </div>
          </button>
        ))}
      </div>
      {selectedDay !== null && complianceData.days[selectedDay] && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">Detalles del día</h3>
          <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto text-gray-800">
            {JSON.stringify(complianceData.days[selectedDay], null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
