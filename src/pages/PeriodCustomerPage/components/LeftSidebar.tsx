import React from 'react'

interface LeftSidebarProps {
  onToggle: () => void
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onToggle }) => {
  return (
    <div className="w-12 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex flex-col items-center py-2 space-y-2">
      <button
        onClick={onToggle}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
        title="Explorer"
        aria-label="Toggle Explorer"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    </div>
  )
}
