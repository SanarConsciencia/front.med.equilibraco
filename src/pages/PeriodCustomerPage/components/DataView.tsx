import React from 'react'
import type { ViewType } from '../types'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'
import { OverviewView } from '../views/OverviewView'
import { DaysView } from '../views/DaysView'
import { PeriodSummaryView } from '../views/PeriodSummaryView'
import { DayDetailView } from '../views/DayDetailView'
import { PeriodTrackingView } from '../views/PeriodTrackingView'
import { PeriodNutrientVarietyView } from '../views/PeriodNutrientVarietyView'
import { PeriodInflammatoryView } from '../views/PeriodInflammatoryView'
import { PeriodNutrientTrendsView } from '../views/PeriodNutrientTrendsView'
import { PeriodMealAnalysisView } from '../views/PeriodMealAnalysisView'
import { PeriodHealthMonitoringView } from '../views/PeriodHealthMonitoringView'
import { PeriodIngredientConsumptionView } from '../views/PeriodIngredientConsumptionView'
import { PlaceholderView } from '../views/PlaceholderView'

interface DataViewProps {
  activeView: ViewType
  complianceData: BulkComplianceResponse | null
  selectedDayIndex?: number | null
}

export const DataView: React.FC<DataViewProps> = ({ activeView, complianceData, selectedDayIndex }) => {
  if (!complianceData) {
    return (
      <div className="text-center py-4 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        Selecciona una sección para visualizar
      </div>
    )
  }

  let viewElement: React.ReactNode

  switch (activeView) {
    case 'overview':
      viewElement = <OverviewView complianceData={complianceData} />
      break


    case 'period-summary':
      viewElement = <PeriodSummaryView complianceData={complianceData} />
      break

    case 'days':
      viewElement = <DaysView complianceData={complianceData} />
      break

    case 'day-detail':
      if (selectedDayIndex !== null && selectedDayIndex !== undefined && complianceData.days[selectedDayIndex]) {
        viewElement = <DayDetailView dayData={complianceData.days[selectedDayIndex]} />
      } else {
        viewElement = <PlaceholderView title="Selecciona un día del explorador" />
      }
      break

    case 'inflammatory':
      viewElement = <PlaceholderView title="Inflamatorio" />
      break

    case 'nutrient-trends':
      viewElement = <PlaceholderView title="Tendencias de nutrientes" />
      break

    case 'meal-analysis':
      viewElement = <PlaceholderView title="Análisis de comidas" />
      break

    case 'tracking':
      viewElement = <PlaceholderView title="Seguimiento" />
      break

    case 'health-monitoring':
      viewElement = <PlaceholderView title="Monitoreo de salud" />
      break

    // Period Summary Detail Views
    case 'period-tracking':
      viewElement = <PeriodTrackingView complianceData={complianceData} />
      break

    case 'period-nutrient-variety':
      viewElement = <PeriodNutrientVarietyView complianceData={complianceData} />
      break

    case 'period-inflammatory':
      viewElement = <PeriodInflammatoryView complianceData={complianceData} />
      break

    case 'period-nutrient-trends':
      viewElement = <PeriodNutrientTrendsView complianceData={complianceData} />
      break

    case 'period-meal-analysis':
      viewElement = <PeriodMealAnalysisView complianceData={complianceData} />
      break

    case 'period-health-monitoring':
      viewElement = <PeriodHealthMonitoringView complianceData={complianceData} />
      break

    case 'period-ingredient-consumption':
      viewElement = <PeriodIngredientConsumptionView complianceData={complianceData} />
      break

    default:
      viewElement = <PlaceholderView title={activeView} />
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-[270px]">
      {viewElement}
    </div>
  )
}
