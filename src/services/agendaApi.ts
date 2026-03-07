/**
 * agendaApi.ts
 * Servicio para consumir todos los endpoints de agenda y citas
 * de la API de médicos (medicos.equilibraco.com).
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
} from '../types/agendaTypes'

const BASE_URL = 'https://api.medicos.equilibraco.com'

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    } catch {
      // si no hay body JSON, usamos el status
    }
    throw new Error(detail)
  }
  // 204 No Content no tiene body
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// ============================================================
// AGENDA CONFIG
// ============================================================

export const agendaConfigApi = {
  /**
   * Obtiene toda la configuración de agenda del médico autenticado.
   */
  getAll: async (token: string): Promise<AgendaConfigResponse[]> => {
    const res = await fetch(`${BASE_URL}/api/v1/agenda/config`, {
      headers: authHeaders(token),
    })
    return handleResponse<AgendaConfigResponse[]>(res)
  },

  /**
   * Crea o actualiza la configuración de un día de la semana.
   * Si ya existe ese día, lo sobreescribe (upsert).
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
   * Desactiva un día de la semana sin eliminar la configuración.
   */
  desactivarDia: async (
    token: string,
    diaSemana: number,
  ): Promise<AgendaConfigResponse> => {
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/config/${diaSemana}/desactivar`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
      },
    )
    return handleResponse<AgendaConfigResponse>(res)
  },
}

// ============================================================
// AGENDA BLOQUEOS
// ============================================================

export const agendaBloqueosApi = {
  /**
   * Lista todos los bloqueos del médico.
   */
  getAll: async (token: string): Promise<AgendaBloqueoResponse[]> => {
    const res = await fetch(`${BASE_URL}/api/v1/agenda/bloqueos`, {
      headers: authHeaders(token),
    })
    return handleResponse<AgendaBloqueoResponse[]>(res)
  },

  /**
   * Crea un nuevo bloqueo de agenda.
   * Las fechas se envían en hora Colombia sin tzinfo: "2025-03-10T09:00"
   */
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

  /**
   * Elimina un bloqueo por ID.
   */
  eliminar: async (token: string, bloqueoId: number): Promise<void> => {
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/bloqueos/${bloqueoId}`,
      {
        method: 'DELETE',
        headers: authHeaders(token),
      },
    )
    return handleResponse<void>(res)
  },
}

// ============================================================
// DISPONIBILIDAD
// ============================================================

export const disponibilidadApi = {
  /**
   * Obtiene los slots disponibles del médico para una fecha y duración dadas.
   * Usado tanto por el médico (vista interna) como base para el paciente.
   *
   * @param fecha           "YYYY-MM-DD" en hora Colombia
   * @param duracionMinutos Duración deseada en minutos
   */
  getSlots: async (
    token: string,
    fecha: string,
    duracionMinutos: number,
  ): Promise<SlotsDisponiblesResponse> => {
    const params = new URLSearchParams({
      duracion_minutos: String(duracionMinutos),
    })
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
  /**
   * Lista citas del médico con filtros opcionales.
   * Todos los parámetros son opcionales.
   */
  getAll: async (
    token: string,
    filtros?: {
      desde?: string        // "YYYY-MM-DD"
      hasta?: string        // "YYYY-MM-DD"
      estado?: EstadoCita
    },
  ): Promise<CitaResponse[]> => {
    const params = new URLSearchParams()
    if (filtros?.desde)  params.set('desde', filtros.desde)
    if (filtros?.hasta)  params.set('hasta', filtros.hasta)
    if (filtros?.estado) params.set('estado', filtros.estado)

    const query = params.toString() ? `?${params}` : ''
    const res = await fetch(`${BASE_URL}/api/v1/agenda/citas${query}`, {
      headers: authHeaders(token),
    })
    return handleResponse<CitaResponse[]>(res)
  },

  /**
   * Obtiene el detalle completo de una cita por ID.
   */
  getById: async (token: string, citaId: number): Promise<CitaResponse> => {
    const res = await fetch(`${BASE_URL}/api/v1/agenda/citas/${citaId}`, {
      headers: authHeaders(token),
    })
    return handleResponse<CitaResponse>(res)
  },

  /**
   * Actualiza el estado de una cita (confirmar, completar, no-show, cancelar).
   */
  actualizarEstado: async (
    token: string,
    citaId: number,
    data: CitaUpdateEstado,
  ): Promise<CitaResponse> => {
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/citas/${citaId}/estado`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
    )
    return handleResponse<CitaResponse>(res)
  },

  /**
   * Reagenda una cita a un nuevo horario.
   * Marca la cita original como REAGENDADA y crea una nueva.
   */
  reagendar: async (
    token: string,
    citaId: number,
    data: CitaReagendar,
  ): Promise<CitaResponse> => {
    const res = await fetch(
      `${BASE_URL}/api/v1/agenda/citas/${citaId}/reagendar`,
      {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
      },
    )
    return handleResponse<CitaResponse>(res)
  },
}