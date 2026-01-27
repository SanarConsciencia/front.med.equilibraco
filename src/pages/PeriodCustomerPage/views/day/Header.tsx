import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DayAnalysisResponse } from '../../../../types/medicalApiTypes'

interface DayHeaderProps {
  dayData: DayAnalysisResponse
}

export const DayHeader: React.FC<DayHeaderProps> = ({ dayData }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* First line: date (left) and configuration (right) */}
        <div className="min-w-0 flex-1">
          {/* Format date into weekday (lunes), month (enero) and year (2026) */}
          {(() => {
            const raw = dayData.day.date
            let weekday = ''
            let dayNum = ''
            let month = ''
            let year = ''
            try {
              const d = new Date(raw)
              weekday = format(d, 'EEEE', { locale: es })
              dayNum = format(d, 'd', { locale: es })
              month = format(d, 'MMMM', { locale: es })
              year = format(d, 'yyyy', { locale: es })
            } catch (e) {
              // fallback to raw
              dayNum = raw
            }

            return (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Día: {weekday} {dayNum} {month} {year}
                </h2>

                {/* Routine / day configuration - moved here */}
                <div className="mt-2 flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {(() => {
                    const patternId = dayData.day.pattern_id ?? null
                    const trainingDay = dayData.day.training_day
                    const pattern = dayData.requirements?.pattern

                    if (patternId) {
                      const isRest = pattern?.pattern_type === 'rest_day' || pattern?.rest_day === true
                      const workout = pattern?.workout_timing

                      return (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Rutina:</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{pattern?.name ?? patternId}</span>

                          {isRest && (
                            <span className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200">Día de descanso</span>
                          )}

                          {workout && (
                            <div className="flex items-center gap-2">
                              {workout.workout_time && <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">Hora: {workout.workout_time}</span>}
                              {typeof workout.duration_minutes === 'number' && <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20">Duración: {workout.duration_minutes} min</span>}
                              {workout.intensity && <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20">Intensidad: {workout.intensity}</span>}
                              {workout.exercise_type && <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20">Tipo: {workout.exercise_type}</span>}
                            </div>
                          )}
                        </div>
                      )
                    }

                    if (trainingDay === true) {
                      return (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Configuración:</span>
                          <span className="px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">Día configurado (sin rutina) — <strong>Entrenamiento</strong></span>
                        </div>
                      )
                    }

                    if (trainingDay === false) {
                      return (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Configuración:</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">Día configurado (sin rutina) — Día de descanso</span>
                        </div>
                      )
                    }

                    return <div className="text-sm text-gray-500 dark:text-gray-400">No hay configuración de entrenamiento para este día</div>
                  })()}
                </div>
              </>
            )
          })()}
        </div> 

        {/* Kiwimetro */}
        <div className="min-w-[180px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Kiwimetro</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{dayData.compliance.overall.toFixed(1)}%</div>
        </div>

        {/* Itis score */}
        <div className="min-w-[180px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          {(() => {
            const dii = dayData.inflammatory_analysis?.dii_summary
            const net = dii && typeof dii.balance_neto === 'number' ? dii.balance_neto : null

            // Shivappa percentiles thresholds
            const thresholds = { p25: -2.36, median: 0.23, p75: 1.9, p90: 4.0 }

            const getCategory = (value: number | null) => {
              if (value === null) return null
              if (value < thresholds.p25) return { label: 'Fuerte antiinf', badge: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300', color: 'text-green-600 dark:text-green-400' }
              if (value >= thresholds.p25 && value < thresholds.median) return { label: 'Moderada antiinf', badge: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300', color: 'text-teal-600 dark:text-teal-400' }
              if (value >= thresholds.median && value < thresholds.p75) return { label: 'Neutro', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', color: 'text-gray-700 dark:text-gray-300' }
              if (value >= thresholds.p75 && value < thresholds.p90) return { label: 'Moderada proinf', badge: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300', color: 'text-yellow-600 dark:text-yellow-400' }
              return { label: 'Fuerte proinf', badge: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300', color: 'text-red-600 dark:text-red-400' }
            }

            const category = getCategory(net)

            return (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Itis score</div>
                  <div className={`text-xl font-bold ${category ? category.color : 'text-gray-700 dark:text-gray-300'}`}>{net !== null ? net.toFixed(2) : 'N/A'}</div>
                </div>

                {category && (
                  <span
                    className={`ml-3 px-2 py-0.5 rounded text-xs ${category.badge}`}
                    title={`Interpretación: ${category.label} (Shivappa percentiles)`}
                  >
                    {category.label}
                  </span>
                )}
              </div>
            )
          })()}
        </div>



        {/* Second line: stat cards for Kiwimetro & Itis (full-width below on small screens) */}
      </div>

      
    </div>
  )
}

