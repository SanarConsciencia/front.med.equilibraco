import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DayAnalysisResponse } from '../../../../types/medicalApiTypes'

interface InflammatoryAnalysisProps {
  dayData: DayAnalysisResponse
  customerFullName?: string
}

export const InflammatoryAnalysis: React.FC<InflammatoryAnalysisProps> = ({ dayData, customerFullName }) => {
  const ia = dayData.inflammatory_analysis || {}

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Análisis inflamatorio
          {dayData.day?.date && (
            <span className="ml-2 text-base font-normal text-gray-600 dark:text-gray-400">
              {format(new Date(dayData.day.date), "EEEE d 'de' MMMM yyyy", { locale: es })}
            </span>
          )}
          {customerFullName && (
            <span className="ml-1 text-base font-normal text-gray-600 dark:text-gray-400">
              de {customerFullName}
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Resumen del DII y métricas relacionadas con ingredientes y bioactivos
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* DII Score Section - Destacado */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Scores Container */}
            <div className="flex-shrink-0 flex gap-3">
              {/* DII Score */}
              <div className="inline-flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg px-6 py-4 shadow-sm min-w-[140px]">
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  DII Score
                </span>
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {ia.day_dii !== undefined && ia.day_dii !== null ? ia.day_dii.toFixed(2) : 'N/A'}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                  {ia.dii_interpretation || 'Sin clasificar'}
                </span>
              </div>

              {/* Kiwimetro */}
              <div className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-4 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium block mb-1">
                  Kiwimetro
                </span>
                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 block">
                  {dayData.compliance?.overall !== undefined ? dayData.compliance.overall.toFixed(1) : '0.0'}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1 block">
                  Cumplimiento del día
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div className="flex-1">
              <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {ia.dii_explanation || 'Sin explicación disponible para este índice.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Ingredientes Totales */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Ingredientes
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {ia.total_ingredients ?? 0}
            </div>
          </div>

          {/* Probióticos */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
              Probióticos
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {ia.probiotic_count ?? 0}
            </div>
          </div>

          {/* Prebióticos */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Prebióticos
            </div>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {ia.prebiotic_count ?? 0}
            </div>
          </div>

          {/* Ratio Omega */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
              Ratio Ω-6/Ω-3
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {ia.omega_6_3_ratio !== undefined && ia.omega_6_3_ratio !== null 
                ? (typeof ia.omega_6_3_ratio === 'string' && !isNaN(Number(ia.omega_6_3_ratio)) 
                    ? Number(ia.omega_6_3_ratio).toFixed(2) 
                    : ia.omega_6_3_ratio)
                : '-'}
            </div>
          </div>

          {/* NOVA Desglose */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 col-span-2 md:col-span-3 lg:col-span-1">
            <div className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">
              NOVA
            </div>
            {ia.nova_count ? (
              <div className="flex flex-wrap gap-2 text-xs font-medium text-purple-700 dark:text-purple-300">
                <span className="bg-white dark:bg-purple-900/40 px-2 py-1 rounded">
                  1: {(ia.nova_count as any).nova_1 ?? 0}
                </span>
                <span className="bg-white dark:bg-purple-900/40 px-2 py-1 rounded">
                  2: {(ia.nova_count as any).nova_2 ?? 0}
                </span>
                <span className="bg-white dark:bg-purple-900/40 px-2 py-1 rounded">
                  3: {(ia.nova_count as any).nova_3 ?? 0}
                </span>
                <span className="bg-white dark:bg-purple-900/40 px-2 py-1 rounded">
                  4: {(ia.nova_count as any).nova_4 ?? 0}
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Sin datos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}