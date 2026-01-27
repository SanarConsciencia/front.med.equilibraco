import React from 'react'

interface RightSidebarProps {
  expanded: boolean
  onToggle: () => void
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ expanded, onToggle }) => {
  return (
    <>
      {/* Right Sidebar Content */}
      {expanded && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 text-gray-700 dark:text-gray-200">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-4">Objetivos SMART</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sección en desarrollo...</p>
        </div>
      )}

      {/* Right Sidebar Toggle Button */}
      <div className="w-12 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-2">
        <button
          onClick={onToggle}
          className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
          title="Objetivos SMART"
          aria-label="Toggle Objetivos SMART"
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </button>
      </div>
    </>
  )
}
