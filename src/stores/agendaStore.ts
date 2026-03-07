import { create } from 'zustand'
import { agendaConfigApi, agendaBloqueosApi } from '../services/agendaApi'
import type {
  AgendaConfigResponse,
  AgendaBloqueoResponse,
  AgendaConfigCreate,
  AgendaBloqueoCreate,
  DiaAgendaForm,
} from '../types/agendaTypes'
import { DIAS_SEMANA } from '../types/agendaTypes'

// ── Estado ────────────────────────────────────────────────────────────────────

interface AgendaState {
  // Configuración semanal
  configs: AgendaConfigResponse[]
  loadingConfigs: boolean
  errorConfigs: string | null

  // Bloqueos
  bloqueos: AgendaBloqueoResponse[]
  loadingBloqueos: boolean
  errorBloqueos: string | null

  // Acciones — configs
  fetchConfigs: (token: string) => Promise<void>
  upsertConfig: (token: string, data: AgendaConfigCreate) => Promise<void>
  desactivarDia: (token: string, diaSemana: number) => Promise<void>

  // Acciones — bloqueos
  fetchBloqueos: (token: string) => Promise<void>
  crearBloqueo: (token: string, data: AgendaBloqueoCreate) => Promise<void>
  eliminarBloqueo: (token: string, bloqueoId: number) => Promise<void>

  // Helpers
  getFormDias: () => DiaAgendaForm[]
  clearErrors: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAgendaStore = create<AgendaState>((set, get) => ({
  configs: [],
  loadingConfigs: false,
  errorConfigs: null,

  bloqueos: [],
  loadingBloqueos: false,
  errorBloqueos: null,

  // ── Configs ─────────────────────────────────────────────────────────────────

  fetchConfigs: async (token) => {
    set({ loadingConfigs: true, errorConfigs: null })
    try {
      const data = await agendaConfigApi.getAll(token)
      set({ configs: data, loadingConfigs: false })
    } catch (err) {
      set({
        loadingConfigs: false,
        errorConfigs: err instanceof Error ? err.message : 'Error al cargar la agenda',
      })
    }
  },

  upsertConfig: async (token, data) => {
    // Optimistic: marcamos el día como guardando en el state local no hace falta,
    // simplemente hacemos el request y refrescamos.
    try {
      const updated = await agendaConfigApi.upsert(token, data)
      set((state) => {
        const exists = state.configs.find((c) => c.dia_semana === updated.dia_semana)
        if (exists) {
          return {
            configs: state.configs.map((c) =>
              c.dia_semana === updated.dia_semana ? updated : c,
            ),
          }
        }
        // Insertar y ordenar por dia_semana
        return {
          configs: [...state.configs, updated].sort(
            (a, b) => a.dia_semana - b.dia_semana,
          ),
        }
      })
    } catch (err) {
      set({
        errorConfigs: err instanceof Error ? err.message : 'Error al guardar el día',
      })
      throw err // re-throw para que el componente pueda mostrar feedback
    }
  },

  desactivarDia: async (token, diaSemana) => {
    try {
      const updated = await agendaConfigApi.desactivarDia(token, diaSemana)
      set((state) => ({
        configs: state.configs.map((c) =>
          c.dia_semana === diaSemana ? updated : c,
        ),
      }))
    } catch (err) {
      set({
        errorConfigs: err instanceof Error ? err.message : 'Error al desactivar el día',
      })
      throw err
    }
  },

  // ── Bloqueos ─────────────────────────────────────────────────────────────────

  fetchBloqueos: async (token) => {
    set({ loadingBloqueos: true, errorBloqueos: null })
    try {
      const data = await agendaBloqueosApi.getAll(token)
      set({ bloqueos: data, loadingBloqueos: false })
    } catch (err) {
      set({
        loadingBloqueos: false,
        errorBloqueos: err instanceof Error ? err.message : 'Error al cargar bloqueos',
      })
    }
  },

  crearBloqueo: async (token, data) => {
    try {
      const nuevo = await agendaBloqueosApi.crear(token, data)
      set((state) => ({
        bloqueos: [...state.bloqueos, nuevo].sort(
          (a, b) =>
            new Date(a.fecha_inicio_colombia).getTime() -
            new Date(b.fecha_inicio_colombia).getTime(),
        ),
      }))
    } catch (err) {
      set({
        errorBloqueos: err instanceof Error ? err.message : 'Error al crear el bloqueo',
      })
      throw err
    }
  },

  eliminarBloqueo: async (token, bloqueoId) => {
    try {
      await agendaBloqueosApi.eliminar(token, bloqueoId)
      set((state) => ({
        bloqueos: state.bloqueos.filter((b) => b.id !== bloqueoId),
      }))
    } catch (err) {
      set({
        errorBloqueos: err instanceof Error ? err.message : 'Error al eliminar el bloqueo',
      })
      throw err
    }
  },

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /**
   * Construye un array de 7 DiaAgendaForm fusionando los configs guardados
   * con los días que aún no tienen configuración.
   * Siempre retorna los 7 días en orden lunes→domingo.
   */
  getFormDias: () => {
    const { configs } = get()

    return DIAS_SEMANA.map(({ dia_semana, dia_nombre }) => {
      const config = configs.find((c) => c.dia_semana === dia_semana)

      if (config) {
        return {
          dia_semana,
          dia_nombre,
          hora_inicio: config.hora_inicio,
          hora_fin: config.hora_fin,
          duraciones_minutos: config.duraciones_minutos,
          is_active: config.is_active,
          editando: false,
          guardando: false,
        } satisfies DiaAgendaForm
      }

      // Día no configurado — valores por defecto
      return {
        dia_semana,
        dia_nombre,
        hora_inicio: '08:00',
        hora_fin: '17:00',
        duraciones_minutos: [30, 45, 60],
        is_active: false,
        editando: false,
        guardando: false,
      } satisfies DiaAgendaForm
    })
  },

  clearErrors: () => set({ errorConfigs: null, errorBloqueos: null }),
}))