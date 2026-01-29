import React from 'react'
import type { Tab } from '../types'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'
import { TabBar } from './TabBar'
import { OverviewView } from '../views/OverviewView'
import { DayDetailView } from '../views/DayDetailView'
import { PeriodTrackingView } from '../views/PeriodTrackingView'
import { PeriodNutrientVarietyView } from '../views/period/PeriodNutrientVarietyView'
import { PeriodInflammatoryView } from '../views/period/PeriodInflammatoryView'
import { PeriodNutrientTrendsView } from '../views/period/PeriodNutrientTrendsView'
import { PeriodMealAnalysisView } from '../views/period/PeriodMealAnalysisView'
import { PeriodHealthMonitoringView } from '../views/PeriodHealthMonitoringView'
import { PeriodIngredientConsumptionView } from '../views/period/PeriodIngredientConsumptionView'
import { PlaceholderView } from '../views/PlaceholderView'

interface DataViewProps {
  tabs: Tab[]
  activeTabId: string | null
  complianceData: BulkComplianceResponse | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

export const DataView: React.FC<DataViewProps> = ({ tabs, activeTabId, complianceData, onTabSelect, onTabClose }) => {
  if (!complianceData) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        Selecciona una sección del explorador para comenzar
      </div>
    )
  }

  // Find active tab
  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        Selecciona una sección del explorador para comenzar
      </div>
    )
  }

  let viewElement: React.ReactNode

  switch (activeTab.viewType) {
    case 'overview':
      viewElement = <OverviewView complianceData={complianceData} />
      break
    
    case 'day-detail':
      if (activeTab.dayIndex !== null && activeTab.dayIndex !== undefined && complianceData.days[activeTab.dayIndex]) {
        viewElement = <DayDetailView dayData={complianceData.days[activeTab.dayIndex]} customerFullName={complianceData.customer_info.customer_full_name} />
      } else {
        viewElement = <PlaceholderView title="Día no encontrado" />
      }
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
      viewElement = <PlaceholderView title={activeTab.viewType} />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {viewElement}
      </div>
    </div>
  )
}
