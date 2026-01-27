import React from 'react'
import type { ViewType } from '../types'
import type { BulkComplianceResponse } from '../../../types/medicalApiTypes'
import { OverviewView } from '../views/OverviewView'
import { CustomerInfoView } from '../views/CustomerInfoView'
import { DaysView } from '../views/DaysView'
import { PeriodSummaryView } from '../views/PeriodSummaryView'
import { PlaceholderView } from '../views/PlaceholderView'

interface DataViewProps {
  activeView: ViewType
  complianceData: BulkComplianceResponse | null
}

export const DataView: React.FC<DataViewProps> = ({ activeView, complianceData }) => {
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

    case 'customer-info':
      viewElement = <CustomerInfoView complianceData={complianceData} />
      break

    case 'period-summary':
      viewElement = <PeriodSummaryView complianceData={complianceData} />
      break

    case 'days':
      viewElement = <DaysView complianceData={complianceData} />
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

    default:
      viewElement = <PlaceholderView title={activeView} />
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-[270px]">
      {viewElement}
    </div>
  )
}
