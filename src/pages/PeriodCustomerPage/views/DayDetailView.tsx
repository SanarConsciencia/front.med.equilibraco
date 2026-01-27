import React from 'react'
import type { DayAnalysisResponse } from '../../../types/medicalApiTypes'

interface DayDetailViewProps {
  dayData: DayAnalysisResponse
}

export const DayDetailView: React.FC<DayDetailViewProps> = ({ dayData }) => {
  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Día: {dayData.day.date}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Compliance General: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{dayData.compliance.overall.toFixed(1)}%</span>
        </p>
      </div>

      {/* Compliance by Slot */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Compliance por Slot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dayData.compliance.by_slot.map((slot, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{slot.slot_name}</span>
                <span className={`text-sm font-bold ${slot.overall >= 80 ? 'text-green-600 dark:text-green-400' : slot.overall >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {slot.overall.toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Proteínas:</span>
                  <span>{slot.proteins_g.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbohidratos:</span>
                  <span>{slot.carbs_g.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Grasas:</span>
                  <span>{slot.fats_g.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inflammatory Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Análisis Inflamatorio</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">DII Score</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {dayData.inflammatory_analysis.day_dii?.toFixed(2) ?? 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dayData.inflammatory_analysis.dii_interpretation}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Ingredientes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {dayData.inflammatory_analysis.total_ingredients}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <div>🥦 Probióticos: {dayData.inflammatory_analysis.probiotic_count}</div>
                <div>🌾 Prebióticos: {dayData.inflammatory_analysis.prebiotic_count}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meals Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Comidas del Día</h3>
        <div className="space-y-3">
          {dayData.contributions.by_meal.map((meal, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3"
            >
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{meal.meal_name}</h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-4 gap-2">
                <div>
                  <span className="font-medium">Proteínas:</span> {meal.totals.proteins_g.toFixed(1)}g
                </div>
                <div>
                  <span className="font-medium">Carbos:</span> {meal.totals.carbs_g.toFixed(1)}g
                </div>
                <div>
                  <span className="font-medium">Grasas:</span> {meal.totals.fats_g.toFixed(1)}g
                </div>
                <div>
                  <span className="font-medium">Fibra:</span> {meal.totals.fiber_g.toFixed(1)}g
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {meal.ingredients.length} ingrediente{meal.ingredients.length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Info */}
      {dayData.tracking && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Seguimiento</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Hidratación</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {(dayData.tracking.total_hydration_ml / 1000).toFixed(1)}L
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Pasos</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {dayData.tracking.total_steps.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Sueño</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {dayData.tracking.total_sleep_minutes 
                  ? `${(dayData.tracking.total_sleep_minutes / 60).toFixed(1)}h` 
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Síntomas</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {dayData.tracking.number_of_symptoms}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
