import React from 'react'

interface PlaceholderViewProps {
  title: string
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vista: {title}</h2>
      <p className="text-gray-600 dark:text-gray-400">Contenido de esta vista en desarrollo...</p>
    </div>
  )
}
