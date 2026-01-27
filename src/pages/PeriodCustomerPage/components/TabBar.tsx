import React from 'react'
import type { Tab } from '../types'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabSelect, onTabClose }) => {
  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto" role="tablist" aria-label="Pestañas del visualizador">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'true' : undefined}
            title={tab.label}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onTabSelect(tab.id)
            }}
            className={`
              group flex items-center gap-2 px-4 py-2 border-r border-gray-200 dark:border-gray-800 cursor-pointer
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-[120px] max-w-[200px]
              ${isActive ? 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border-b-2 border-indigo-500' : 'bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-400'}
            `}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="truncate flex-1 text-sm">
              {tab.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-0.5 transition-opacity"
              aria-label="Cerrar pestaña"
              title="Cerrar pestaña"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
