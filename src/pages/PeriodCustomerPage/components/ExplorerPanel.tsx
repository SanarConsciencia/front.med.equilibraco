import React, { useState } from 'react'
import type { ViewType } from '../types'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'

interface ExplorerPanelProps {
  activeView: ViewType
  complianceData: BulkComplianceResponse
  onViewChange: (view: ViewType, dayIndex?: number) => void
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const navItems: NavItem[] = [
    { id: 'overview', icon: '📊', label: 'Resumen' },
    { id: 'days', icon: '📅', label: 'Días', count: complianceData.days.length },
    { id: 'period-summary', icon: '📈', label: 'Resumen del período' },
  ]

  const periodSummaryItems: Array<{id: ViewType; icon: string; label: string}> = [
    { id: 'period-tracking', icon: '📊', label: 'Seguimiento' },
    { id: 'period-nutrient-variety', icon: '🌈', label: 'Variedad de nutrientes' },
    { id: 'period-inflammatory', icon: '🔥', label: 'Resumen inflamatorio' },
    { id: 'period-nutrient-trends', icon: '📈', label: 'Tendencias de nutrientes' },
    { id: 'period-meal-analysis', icon: '🍽️', label: 'Análisis de comidas' },
    { id: 'period-health-monitoring', icon: '❤️', label: 'Monitoreo de salud' },
    { id: 'period-ingredient-consumption', icon: '🥗', label: 'Consumo de ingredientes' },
  ]

  const isDaysExpanded = expandedSections.has('days')
  const isPeriodSummaryExpanded = expandedSections.has('period-summary')

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto text-gray-700 dark:text-gray-200">
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Explorador</h3>
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.id === 'days' || item.id === 'period-summary') {
                    toggleSection(item.id)
                  } else {
                    onViewChange(item.id)
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 flex items-center justify-between ${
                  activeView === item.id && item.id !== 'days' && item.id !== 'period-summary'
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-pressed={activeView === item.id}
              >
                <span className="flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({item.count})</span>
                  )}
                </span>
                {(item.id === 'days' || item.id === 'period-summary') && (
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      (item.id === 'days' && isDaysExpanded) || (item.id === 'period-summary' && isPeriodSummaryExpanded) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {/* Expandable Days List */}
              {item.id === 'days' && isDaysExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {complianceData.days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => onViewChange('day-detail', idx)}
                      className="w-full text-left px-3 py-1.5 rounded text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      <span className="mr-2">📄</span>
                      {day.day.date} ({day.compliance.overall.toFixed(0)}%)
                    </button>
                  ))}
                </div>
              )}

              {/* Expandable Period Summary List */}
              {item.id === 'period-summary' && isPeriodSummaryExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {periodSummaryItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onViewChange(subItem.id)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        activeView === subItem.id
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{subItem.icon}</span>
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
