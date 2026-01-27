/**
 * medicalApiServices.ts
 * Servicio para consumir el endpoint de Bulk Compliance desde intake.equilibraco.com
 * Endpoint ejemplo:
 * GET https://api.intake.equilibraco.com/api/v1/medical/compliance?doctor_uuid=...&customer_id=...&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */

import type { BulkComplianceResponse } from '../types/medicalApiTypes'

const INTAKE_BASE_URL = 'https://api.intake.equilibraco.com'

export interface ComplianceRequestParams {
  doctor_uuid: string
  customer_id: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

// Using BulkComplianceResponse from '../types/medicalApiTypes'

/**
 * Llama al endpoint de compliance del Intake API.
 * Acepta un AbortSignal opcional para permitir cancelación.
 */
export const medicalApi = {
  getCompliance: async (
    params: ComplianceRequestParams,
    signal?: AbortSignal,
  ): Promise<BulkComplianceResponse> => {
    const query = new URLSearchParams({
      doctor_uuid: params.doctor_uuid,
      customer_id: params.customer_id,
      start_date: params.start_date,
      end_date: params.end_date,
    })

    const url = `${INTAKE_BASE_URL}/api/v1/medical/compliance?${query}`

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
      signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to fetch compliance (${response.status}): ${text}`)
    }

    return response.json() as Promise<BulkComplianceResponse>
  },

  /**
   * Health check endpoint to verify connectivity to Intake API.
   * Returns raw JSON from the server (kept flexible).
   */
  getHealth: async (signal?: AbortSignal): Promise<Record<string, any>> => {
    const url = `${INTAKE_BASE_URL}/api/v1/medical/health`
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Health check failed (${res.status}): ${text}`)
    }

    return res.json()
  },
}

/**
 * Ejemplo de uso:
 *
 * const controller = new AbortController()
 * medicalApi.getCompliance({ doctor_uuid, customer_id, start_date, end_date }, controller.signal)
 *   .then(data => { /* persistir en store * / })
 *   .catch(err => { /* manejar error * / })
 * // si necesitas cancelar: controller.abort()
 */
