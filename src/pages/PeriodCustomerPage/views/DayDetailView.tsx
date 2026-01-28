import React from 'react'
import type { DayAnalysisResponse } from '../../../types/medicalApiTypes'
import { DayHeader } from './day/Header'
import { ComplianceChart } from './day/ComplianceChart'
import { DayMeals } from './day/DayMeals'
import { InflammatoryAnalysis } from './day/InflammatoryAnalysis'
import { TrackingInfo } from './day/TrackingInfo' 

interface DayDetailViewProps {
  dayData: DayAnalysisResponse
  customerFullName?: string
}

export const DayDetailView: React.FC<DayDetailViewProps> = ({ dayData, customerFullName }) => {
  return (
    <div className="space-y-6 px-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 max-w-full overflow-x-hidden">
      <DayHeader dayData={dayData} />
      
      {/* Inflammatory Analysis */}
      <InflammatoryAnalysis dayData={dayData} customerFullName={customerFullName} />

      {/* Compliance Chart */}
      <ComplianceChart dayData={dayData} customerFullName={customerFullName} />

      {/* Day Meals */}
      <DayMeals dayData={dayData} customerFullName={customerFullName} />
      
      
      
      

      <TrackingInfo dayData={dayData} customerFullName={customerFullName} />
    </div>
  )
}
