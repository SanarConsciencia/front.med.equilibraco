import { useComplianceStore } from '../stores/complianceStore'
import type { ComplianceRequestParams } from '../services/medicalApiServices'

/**
 * Custom hook para facilitar el acceso al store de compliance
 * Encapsula la lógica del store y proporciona una interfaz limpia
 */
export const useCompliance = () => {
  const {
    complianceData,
    isLoading,
    error,
    currentParams,
    fetchCompliance,
    clearCompliance,
    clearError,
  } = useComplianceStore()

  /**
   * Fetch compliance data with params
   */
  const loadCompliance = async (params: ComplianceRequestParams) => {
    try {
      await fetchCompliance(params)
      return true
    } catch (err) {
      console.error('Error loading compliance:', err)
      return false
    }
  }

  /**
   * Check if data is available
   */
  const hasData = complianceData !== null

  /**
   * Get customer info from compliance data
   */
  const customerInfo = complianceData?.customer_info || null

  /**
   * Get period info from compliance data
   */
  const periodInfo = complianceData?.period || null

  /**
   * Get period summary from compliance data
   */
  const periodSummary = complianceData?.period_summary || null

  /**
   * Get days data from compliance data
   */
  const daysData = complianceData?.days || []

  return {
    // Data
    complianceData,
    customerInfo,
    periodInfo,
    periodSummary,
    daysData,
    
    // State
    isLoading,
    error,
    hasData,
    currentParams,
    
    // Actions
    loadCompliance,
    clearCompliance,
    clearError,
  }
}
