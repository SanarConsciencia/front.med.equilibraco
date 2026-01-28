import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DayAnalysisResponse } from '../../../../types/medicalApiTypes'

interface TrackingInfoProps {
  dayData: DayAnalysisResponse
  customerFullName?: string
}

export const TrackingInfo: React.FC<TrackingInfoProps> = ({ dayData, customerFullName }) => {
  const t = dayData.tracking

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Seguimiento{dayData.day?.date ? ` ${format(new Date(dayData.day.date), "EEEE d 'de' MMMM yyyy", { locale: es })}` : ''}{customerFullName ? ` de ${customerFullName}` : ''}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Resumen de seguimiento: hidratación, pasos, sueño y síntomas.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Hidratación</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {t && t.total_hydration_ml !== undefined ? `${(t.total_hydration_ml / 1000).toFixed(1)}L` : 'N/A'}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Pasos</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {t && t.total_steps !== undefined ? t.total_steps.toLocaleString() : 'N/A'}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Sueño</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {t && t.total_sleep_minutes ? `${(t.total_sleep_minutes / 60).toFixed(1)}h` : 'N/A'}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Síntomas</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {t && t.number_of_symptoms !== undefined ? t.number_of_symptoms : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
