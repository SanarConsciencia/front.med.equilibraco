import React from 'react'
import type { ViewType } from '../types'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface ExplorerPanelProps {
  activeView: ViewType
  complianceData: BulkComplianceResponse
  onViewChange: (view: ViewType) => void
}

interface NavItem {
  id: ViewType
  icon: string
  label: string
  count?: number
}

export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({
  activeView,
  complianceData,
  onViewChange
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', icon: '📊', label: 'Resumen' },
    { id: 'customer-info', icon: '👤', label: 'Información del cliente' },
    { id: 'days', icon: '📅', label: 'Días', count: complianceData.days.length },
    { id: 'period-summary', icon: '📈', label: 'Resumen del período' },
    { id: 'inflammatory', icon: '🔥', label: 'Inflamatorio' },
    { id: 'nutrient-trends', icon: '📉', label: 'Tendencias de nutrientes' },
    { id: 'meal-analysis', icon: '🍽️', label: 'Análisis de comidas' },
    { id: 'tracking', icon: '📍', label: 'Seguimiento' },
    { id: 'health-monitoring', icon: '❤️', label: 'Monitoreo de salud' },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto text-gray-700 dark:text-gray-200">
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Explorador</h3>
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 ${
                activeView === item.id
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              aria-pressed={activeView === item.id}
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({item.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
