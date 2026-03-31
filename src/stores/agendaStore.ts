import { create } from 'zustand'
import { agendaConfigApi, agendaBloqueosApi } from '../services/agendaApi'
import type {
  AgendaConfigResponse,
  AgendaBloqueoResponse,
  AgendaConfigCreate,
  AgendaBloqueoCreate,
  DiaAgendaForm,
  TipoAgenda,
} from '../types/agendaTypes'
import { DIAS_SEMANA, DURACION_ASISTENCIAL_DEFAULT, DURACION_DESCUBRIMIENTO_DEFAULT } from '../types/agendaTypes'

// ── Estado ────────────────────────────────────────────────────────────────────

interface AgendaState {
  // Configuraciones separadas por tipo
  configsAsistencial:    AgendaConfigResponse[]
  configsDescubrimiento: AgendaConfigResponse[]
  loadingConfigs:        boolean
  errorConfigs:          string | null

  // Bloqueos (aplican a ambos tipos)
  bloqueos:       AgendaBloqueoResponse[]
  loadingBloqueos: boolean
  errorBloqueos:   string | null

  // Acciones — configs
  fetchConfigs:   (token: string, tipo: TipoAgenda) => Promise<void>
  upsertConfig:   (token: string, data: AgendaConfigCreate) => Promise<void>
  desactivarDia:  (token: string, diaSemana: number, tipo: TipoAgenda) => Promise<void>
  eliminarConfig: (token: string, diaSemana: number, tipo: TipoAgenda) => Promise<void>

  // Acciones — bloqueos
  fetchBloqueos:   (token: string) => Promise<void>
  crearBloqueo:    (token: string, data: AgendaBloqueoCreate) => Promise<void>
  eliminarBloqueo: (token: string, bloqueoId: number) => Promise<void>

  // Helpers para construir el formulario UI
  getFormDias: (tipo: TipoAgenda) => DiaAgendaForm[]
  clearErrors: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAgendaStore = create<AgendaState>((set, get) => ({
  configsAsistencial:    [],
  configsDescubrimiento: [],
  loadingConfigs:        false,
  errorConfigs:          null,

  bloqueos:        [],
  loadingBloqueos: false,
  errorBloqueos:   null,

  // ── Configs ─────────────────────────────────────────────────────────────────

  fetchConfigs: async (token, tipo) => {
    set({ loadingConfigs: true, errorConfigs: null })
    try {
      const data = await agendaConfigApi.getAll(token, tipo)
      if (tipo === 'ASISTENCIAL') {
        set({ configsAsistencial: data, loadingConfigs: false })
      } else {
        set({ configsDescubrimiento: data, loadingConfigs: false })
      }
    } catch (err) {
      set({
        loadingConfigs: false,
        errorConfigs: err instanceof Error ? err.message : 'Error al cargar la agenda',
      })
    }
  },

  upsertConfig: async (token, data) => {
    try {
      const updated = await agendaConfigApi.upsert(token, data)
      const tipo = data.tipo

      set((state) => {
        const lista = tipo === 'ASISTENCIAL'
          ? [...state.configsAsistencial]
          : [...state.configsDescubrimiento]

        const idx = lista.findIndex(
          (c) => c.dia_semana === updated.dia_semana && c.tipo === updated.tipo
        )
        if (idx >= 0) {
          lista[idx] = updated
        } else {
          lista.push(updated)
          lista.sort((a, b) => a.dia_semana - b.dia_semana)
        }

        return tipo === 'ASISTENCIAL'
          ? { configsAsistencial: lista }
          : { configsDescubrimiento: lista }
      })
    } catch (err) {
      set({ errorConfigs: err instanceof Error ? err.message : 'Error al guardar' })
      throw err
    }
  },

  desactivarDia: async (token, diaSemana, tipo) => {
    try {
      const updated = await agendaConfigApi.desactivarDia(token, diaSemana, tipo)
      set((state) => {
        const lista = tipo === 'ASISTENCIAL'
          ? state.configsAsistencial.map((c) => c.dia_semana === diaSemana ? updated : c)
          : state.configsDescubrimiento.map((c) => c.dia_semana === diaSemana ? updated : c)

        return tipo === 'ASISTENCIAL'
          ? { configsAsistencial: lista }
          : { configsDescubrimiento: lista }
      })
    } catch (err) {
      set({ errorConfigs: err instanceof Error ? err.message : 'Error al desactivar' })
      throw err
    }
  },

  eliminarConfig: async (token, diaSemana, tipo) => {
    try {
      await agendaConfigApi.eliminar(token, diaSemana, tipo)
      set((state) => {
        const lista = tipo === 'ASISTENCIAL'
          ? state.configsAsistencial.filter((c) => c.dia_semana !== diaSemana)
          : state.configsDescubrimiento.filter((c) => c.dia_semana !== diaSemana)

        return tipo === 'ASISTENCIAL'
          ? { configsAsistencial: lista }
          : { configsDescubrimiento: lista }
      })
    } catch (err) {
      set({ errorConfigs: err instanceof Error ? err.message : 'Error al eliminar' })
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
      set({ errorBloqueos: err instanceof Error ? err.message : 'Error al crear bloqueo' })
      throw err
    }
  },

  eliminarBloqueo: async (token, bloqueoId) => {
    try {
      await agendaBloqueosApi.eliminar(token, bloqueoId)
      set((state) => ({ bloqueos: state.bloqueos.filter((b) => b.id !== bloqueoId) }))
    } catch (err) {
      set({ errorBloqueos: err instanceof Error ? err.message : 'Error al eliminar bloqueo' })
      throw err
    }
  },

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /**
   * Construye el array de 7 DiaAgendaForm para el formulario UI.
   * Los días sin configuración usan valores por defecto.
   */
  getFormDias: (tipo) => {
    const { configsAsistencial, configsDescubrimiento } = get()
    const configs = tipo === 'ASISTENCIAL' ? configsAsistencial : configsDescubrimiento
    const duracionDefault = tipo === 'ASISTENCIAL'
      ? DURACION_ASISTENCIAL_DEFAULT
      : DURACION_DESCUBRIMIENTO_DEFAULT

    return DIAS_SEMANA.map(({ dia_semana, dia_nombre }) => {
      const config = configs.find((c) => c.dia_semana === dia_semana)

      if (config) {
        return {
          dia_semana,
          dia_nombre,
          tipo,
          rangos:           config.rangos,
          duracion_minutos: config.duracion_minutos,
          buffer_minutos:   config.buffer_minutos,
          is_active:        config.is_active,
          editando:         false,
        } satisfies DiaAgendaForm
      }

      return {
        dia_semana,
        dia_nombre,
        tipo,
        rangos:           [],
        duracion_minutos: duracionDefault,
        buffer_minutos:   0,
        is_active:        false,
        editando:         false,
      } satisfies DiaAgendaForm
    })
  },

  clearErrors: () => set({ errorConfigs: null, errorBloqueos: null }),
}))