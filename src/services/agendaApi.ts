/**
 * agendaApi.ts
 * Servicio para consumir todos los endpoints de agenda y citas.
 *
 * Cambios:
 * - AgendaConfig endpoints ahora requieren parámetro `tipo` (ASISTENCIAL | DESCUBRIMIENTO)
 * - getSlots ahora también acepta tipo
 */

import type {
  AgendaConfigResponse,
  AgendaConfigCreate,
  AgendaBloqueoResponse,
  AgendaBloqueoCreate,
  CitaResponse,
  CitaUpdateEstado,
  CitaReagendar,
  SlotsDisponiblesResponse,
  EstadoCita,
  TipoAgenda,
} from '../types/agendaTypes'

const BASE_URL = 'https://api.medicos.equilibraco.com'

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Error ${response.status}`
    try {
      const body = await response.json()
      detail = body?.detail ?? detail
    } catch { /* sin body JSON */ }
    throw new Error(detail)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// ============================================================
// AGENDA CONFIG
// ============================================================

export const agendaConfigApi = {
  /**
   * Obtiene la configuración del médico para un tipo de agenda.
   */
  getAll: async (
    token: string,
    tipo: TipoAgenda,
  ): Promise<AgendaConfigResponse[]> => {
    const params = new URLSearchParams({ tipo })
    const res = await fetch(`${BASE_URL}/api/v1/agenda/config?${params}`, {
      headers: authHeaders(token),
    })
    return handleResponse<AgendaConfigResponse[]>(res)
  },

  /**
   * Crea o actualiza la configuración de un día para un tipo.
   */
  upsert: async (
    token: string,
    data: AgendaConfigCreate,
  ): Promise<AgendaConfigResponse> => {
    const res = await fetch(`${BASE_URL}/api/v1/agenda/config`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<AgendaConfigResponse>(res)
  },

  /**
   * Desactiva un día de la semana para un tipo de agenda.
   */
  desactivarDia: async (
    token: string,
    diaSemana: number,
    tipo: TipoAgenda,
  ): Promise<AgendaConfigResponse> => {
    const params = new URLSearchParams({ tipo })
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/config/${diaSemana}/desactivar?${params}`,
      { method: 'PATCH', headers: authHeaders(token) },
    )
    return handleResponse<AgendaConfigResponse>(res)
  },

  /**
   * Elimina la configuración de un día+tipo.
   */
  eliminar: async (
    token: string,
    diaSemana: number,
    tipo: TipoAgenda,
  ): Promise<void> => {
    const params = new URLSearchParams({ tipo })
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/config/${diaSemana}?${params}`,
      { method: 'DELETE', headers: authHeaders(token) },
    )
    return handleResponse<void>(res)
  },
}

// ============================================================
// AGENDA BLOQUEOS
// ============================================================

export const agendaBloqueosApi = {
  getAll: async (token: string): Promise<AgendaBloqueoResponse[]> => {
    const res = await fetch(`${BASE_URL}/api/v1/agenda/bloqueos`, {
      headers: authHeaders(token),
    })
    return handleResponse<AgendaBloqueoResponse[]>(res)
  },

  crear: async (
    token: string,
    data: AgendaBloqueoCreate,
  ): Promise<AgendaBloqueoResponse> => {
    const res = await fetch(`${BASE_URL}/api/v1/agenda/bloqueos`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    })
    return handleResponse<AgendaBloqueoResponse>(res)
  },

  eliminar: async (token: string, bloqueoId: number): Promise<void> => {
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/bloqueos/${bloqueoId}`,
      { method: 'DELETE', headers: authHeaders(token) },
    )
    return handleResponse<void>(res)
  },
}

// ============================================================
// DISPONIBILIDAD (vista del médico)
// ============================================================

export const disponibilidadApi = {
  /**
   * Slots disponibles para el médico en una fecha y tipo de agenda.
   */
  getSlots: async (
    token:     string,
    fecha:     string,
    tipo:      TipoAgenda,
  ): Promise<SlotsDisponiblesResponse> => {
    const params = new URLSearchParams({ tipo })
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/disponibilidad/${fecha}?${params}`,
      { headers: authHeaders(token) },
    )
    return handleResponse<SlotsDisponiblesResponse>(res)
  },
}

// ============================================================
// CITAS
// ============================================================

export const citasApi = {
  getAll: async (
    token:   string,
    filtros?: {
      desde?:     string
      hasta?:     string
      estado?:    EstadoCita
      tipo_cita?: TipoAgenda
    },
  ): Promise<CitaResponse[]> => {
    const params = new URLSearchParams()
    if (filtros?.desde)     params.set('desde',     filtros.desde)
    if (filtros?.hasta)     params.set('hasta',     filtros.hasta)
    if (filtros?.estado)    params.set('estado',    filtros.estado)
    if (filtros?.tipo_cita) params.set('tipo_cita', filtros.tipo_cita)

    const query = params.toString() ? `?${params}` : ''
    const res = await fetch(`${BASE_URL}/api/v1/agenda/citas${query}`, {
      headers: authHeaders(token),
    })
    return handleResponse<CitaResponse[]>(res)
  },

  getById: async (token: string, citaId: number): Promise<CitaResponse> => {
    const res = await fetch(`${BASE_URL}/api/v1/agenda/citas/${citaId}`, {
      headers: authHeaders(token),
    })
    return handleResponse<CitaResponse>(res)
  },

  actualizarEstado: async (
    token:   string,
    citaId:  number,
    data:    CitaUpdateEstado,
  ): Promise<CitaResponse> => {
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/citas/${citaId}/estado`,
      { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(data) },
    )
    return handleResponse<CitaResponse>(res)
  },

  reagendar: async (
    token:  string,
    citaId: number,
    data:   CitaReagendar,
  ): Promise<CitaResponse> => {
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/citas/${citaId}/reagendar`,
      { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) },
    )
    return handleResponse<CitaResponse>(res)
  },
}