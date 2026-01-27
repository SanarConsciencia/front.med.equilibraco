import React from 'react'

interface NotesEditorProps {
  notes: string
  onChange: (notes: string) => void
  onSave?: () => void
  height?: number
}

export const NotesEditor: React.FC<NotesEditorProps> = ({ notes, onChange, onSave, height = 192 }) => {
  return (
    <div style={{ height }} className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-gray-700 dark:text-gray-200 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Notas Médicas</h3>
        {onSave && (
          <button
            onClick={onSave}
            className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
          >
            Guardar
          </button>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tus observaciones médicas aquí..."
        aria-label="Notas médicas"
        className="w-full flex-1 min-h-0 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 rounded p-2 text-sm resize-none focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
      />
    </div>
  )
}
