import { create } from 'zustand'
import { medicalApi } from '../services/medicalApiServices'
import type { BulkComplianceResponse } from '../types/medicalApiTypes'
import type { ComplianceRequestParams } from '../services/medicalApiServices'

interface ComplianceState {
  // Data
  complianceData: BulkComplianceResponse | null
  
  // Loading & Error states
  isLoading: boolean
  error: string | null
  
  // Current request params (useful for refetching or displaying current period)
  currentParams: ComplianceRequestParams | null
  
  // Actions
  fetchCompliance: (params: ComplianceRequestParams) => Promise<void>
  clearCompliance: () => void
  clearError: () => void
}

export const useComplianceStore = create<ComplianceState>((set) => ({
  // Initial state
  complianceData: null,
  isLoading: false,
  error: null,
  currentParams: null,

  // Fetch compliance data
  fetchCompliance: async (params: ComplianceRequestParams) => {
    set({ isLoading: true, error: null, currentParams: params })
    
    try {
      const data = await medicalApi.getCompliance(params)
      set({ 
        complianceData: data, 
        isLoading: false,
        error: null 
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch compliance data'
      set({ 
        complianceData: null,
        isLoading: false, 
        error: errorMessage 
      })
      throw err // Re-throw para que el componente pueda manejarlo si necesita
    }
  },

  // Clear all compliance data
  clearCompliance: () => {
    set({ 
      complianceData: null, 
      error: null, 
      currentParams: null,
      isLoading: false 
    })
  },

  // Clear only error
  clearError: () => {
    set({ error: null })
  },
}))
