// Shared types for PeriodCustomerPage components

export type ViewType = 
  | 'overview' 
  | 'period-summary' 
  | 'days' 
  | 'day-detail'
  | 'inflammatory' 
  | 'nutrient-trends' 
  | 'meal-analysis' 
  | 'tracking' 
  | 'health-monitoring'  // Period Summary detailed views
  | 'period-tracking'
  | 'period-nutrient-variety'
  | 'period-inflammatory'
  | 'period-nutrient-trends'
  | 'period-meal-analysis'
  | 'period-health-monitoring'
  | 'period-ingredient-consumption'

// Tab interface for the tab system
export interface Tab {
  id: string
  viewType: ViewType
  label: string
  dayIndex?: number | null
}