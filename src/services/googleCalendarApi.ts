/**
 * googleCalendarApi.ts
 * Servicio para los endpoints de Google Calendar OAuth en medicos-api.
 * Mismo patrón que agendaApi.ts — fetch directo con token como parámetro.
 */

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
    } catch {
      // sin body JSON
    }
    throw new Error(detail)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface GoogleCalendarStatus {
  connected:    boolean
  connected_at: string | null   // ISO string UTC o null
}

export interface GoogleAuthUrl {
  authorization_url: string
}

// ── API ───────────────────────────────────────────────────────────────────────

export const googleCalendarApi = {
  /**
   * Obtiene la URL de autorización de Google.
   * El frontend debe hacer window.location.href = authorization_url
   */
  getAuthorizationUrl: async (token: string): Promise<GoogleAuthUrl> => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/google/authorize`, {
      headers: authHeaders(token),
    })
    return handleResponse<GoogleAuthUrl>(res)
  },

  /**
   * Estado actual de la conexión con Google Calendar.
   */
  getStatus: async (token: string): Promise<GoogleCalendarStatus> => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/google/status`, {
      headers: authHeaders(token),
    })
    return handleResponse<GoogleCalendarStatus>(res)
  },

  /**
   * Desconecta Google Calendar — elimina el refresh_token del médico.
   * Las citas futuras ya no crearán eventos en Calendar.
   */
  disconnect: async (token: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/google/disconnect`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    return handleResponse<void>(res)
  },
}