import { create } from 'zustand'
import { citasApi } from '../services/agendaApi'
import type {
  CitaResponse,
  CitaUpdateEstado,
  CitaReagendar,
  EstadoCita,
} from '../types/agendaTypes'
import { todayColombia } from '../types/agendaTypes'

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface CitasFiltros {
  desde: string         // "YYYY-MM-DD"
  hasta: string         // "YYYY-MM-DD"
  estado: EstadoCita | ''
}

function filtrosIniciales(): CitasFiltros {
  const hoy = todayColombia()
  // Por defecto: semana actual (hoy + 7 días)
  const [y, m, d] = hoy.split('-').map(Number)
  const hasta = new Date(y, m - 1, d + 7)
  const hastaStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
  }).format(hasta)

  return { desde: hoy, hasta: hastaStr, estado: '' }
}

// ── Estado ────────────────────────────────────────────────────────────────────

interface CitasState {
  citas: CitaResponse[]
  citaActiva: CitaResponse | null   // cita seleccionada en el modal de detalle
  loading: boolean
  error: string | null
  filtros: CitasFiltros

  // Acciones
  fetchCitas: (token: string, filtros?: Partial<CitasFiltros>) => Promise<void>
  fetchCitaById: (token: string, citaId: number) => Promise<void>
  actualizarEstado: (token: string, citaId: number, data: CitaUpdateEstado) => Promise<void>
  reagendar: (token: string, citaId: number, data: CitaReagendar) => Promise<CitaResponse>
  setFiltros: (filtros: Partial<CitasFiltros>) => void
  setCitaActiva: (cita: CitaResponse | null) => void
  clearError: () => void

  // Helpers de lectura
  getCitasByEstado: (estado: EstadoCita) => CitaResponse[]
  getCitasHoy: () => CitaResponse[]
  getCitasPendientesCount: () => number
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCitasStore = create<CitasState>((set, get) => ({
  citas: [],
  citaActiva: null,
  loading: false,
  error: null,
  filtros: filtrosIniciales(),

  // ── Fetch ──────────────────────────────────────────────────────────────────

  fetchCitas: async (token, filtrosOverride) => {
    const filtros = { ...get().filtros, ...filtrosOverride }
    set({ loading: true, error: null, filtros })

    try {
      const params: { desde?: string; hasta?: string; estado?: EstadoCita } = {
        desde: filtros.desde,
        hasta: filtros.hasta,
      }
      if (filtros.estado) params.estado = filtros.estado

      const data = await citasApi.getAll(token, params)
      set({ citas: data, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar citas',
      })
    }
  },

  fetchCitaById: async (token, citaId) => {
    try {
      const cita = await citasApi.getById(token, citaId)
      set({ citaActiva: cita })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al cargar la cita',
      })
    }
  },

  // ── Actualizar estado ──────────────────────────────────────────────────────

  actualizarEstado: async (token, citaId, data) => {
    try {
      const updated = await citasApi.actualizarEstado(token, citaId, data)

      // Actualizar en la lista y en citaActiva si es la misma
      set((state) => ({
        citas: state.citas.map((c) => (c.id === citaId ? updated : c)),
        citaActiva: state.citaActiva?.id === citaId ? updated : state.citaActiva,
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al actualizar la cita',
      })
      throw err
    }
  },

  // ── Reagendar ──────────────────────────────────────────────────────────────

  reagendar: async (token, citaId, data) => {
    try {
      const nuevaCita = await citasApi.reagendar(token, citaId, data)

      set((state) => {
        // Marcar la original como REAGENDADA en el estado local
        const citasActualizadas = state.citas.map((c) =>
          c.id === citaId ? { ...c, estado: 'REAGENDADA' as EstadoCita } : c,
        )
        // Agregar la nueva cita al inicio (es la más reciente)
        return {
          citas: [nuevaCita, ...citasActualizadas],
          citaActiva: nuevaCita,
        }
      })

      return nuevaCita
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al reagendar la cita',
      })
      throw err
    }
  },

  // ── UI helpers ─────────────────────────────────────────────────────────────

  setFiltros: (filtrosNuevos) =>
    set((state) => ({
      filtros: { ...state.filtros, ...filtrosNuevos },
    })),

  setCitaActiva: (cita) => set({ citaActiva: cita }),

  clearError: () => set({ error: null }),

  // ── Selectores ─────────────────────────────────────────────────────────────

  getCitasByEstado: (estado) =>
    get().citas.filter((c) => c.estado === estado),

  getCitasHoy: () => {
    const hoy = todayColombia()
    return get().citas.filter((c) =>
      c.fecha_hora_inicio_colombia.startsWith(hoy),
    )
  },

  getCitasPendientesCount: () =>
    get().citas.filter(
      (c) => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA',
    ).length,
}))