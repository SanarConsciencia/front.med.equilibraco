import { create } from 'zustand'
import * as micService from '../services/micService'
import type {
  MicPillarWithPhases,
  MicPillarCreate,
  MicPhaseCreate,
  MicObjectiveCreate,
  MicItemCreate,
  MicProgressUpdate,
} from '../types/micTypes'

// Admin key lives only in module memory — never persisted
let _adminKey: string | null = null

interface MicStore {
  pillars: MicPillarWithPhases[]
  isLoading: boolean
  error: string | null

  selectedObjectiveId: number | null
  selectedPillarId: number | null
  selectedPhaseId: number | null

  editMode: boolean
  mobileView: 'tree' | 'detail'

  // Current patient context (needed to refresh after CRUD)
  _customerUuid: string | null
  _token: string | null

  loadProgress: (customerUuid: string, token: string) => Promise<void>
  selectObjective: (objectiveId: number, pillarId: number, phaseId: number) => void
  activateEditMode: (key: string) => boolean
  deactivateEditMode: () => void
  setMobileView: (view: 'tree' | 'detail') => void

  updateProgress: (
    customerUuid: string,
    objectiveId: number,
    data: MicProgressUpdate,
    token: string,
  ) => Promise<void>

  addPillar: (data: MicPillarCreate) => Promise<void>
  editPillar: (id: number, data: Partial<MicPillarCreate>) => Promise<void>
  removePillar: (id: number) => Promise<void>

  addPhase: (pillarId: number, data: MicPhaseCreate) => Promise<void>
  editPhase: (id: number, data: Partial<MicPhaseCreate>) => Promise<void>
  removePhase: (id: number) => Promise<void>

  addObjective: (phaseId: number, data: MicObjectiveCreate) => Promise<void>
  editObjective: (id: number, data: Partial<MicObjectiveCreate>) => Promise<void>
  removeObjective: (id: number) => Promise<void>

  addItem: (objectiveId: number, data: MicItemCreate) => Promise<void>
  editItem: (id: number, data: Partial<MicItemCreate>) => Promise<void>
  removeItem: (id: number) => Promise<void>
}

function requireAdminKey(): string {
  if (!_adminKey) throw new Error('Edit mode not active')
  return _adminKey
}

export const useMicStore = create<MicStore>((set, get) => ({
  pillars: [],
  isLoading: false,
  error: null,

  selectedObjectiveId: null,
  selectedPillarId: null,
  selectedPhaseId: null,

  editMode: false,
  mobileView: 'tree',

  _customerUuid: null,
  _token: null,

  loadProgress: async (customerUuid, token) => {
    set({ isLoading: true, error: null, _customerUuid: customerUuid, _token: token })
    try {
      const data = await micService.getPatientProgress(customerUuid, token)
      set({ pillars: data.pillars, isLoading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el progreso'
      set({ error: msg, isLoading: false })
    }
  },

  selectObjective: (objectiveId, pillarId, phaseId) => {
    set({ selectedObjectiveId: objectiveId, selectedPillarId: pillarId, selectedPhaseId: phaseId })
  },

  activateEditMode: (key) => {
    const correct = import.meta.env.VITE_MIC_ADMIN_KEY as string
    if (key === correct) {
      _adminKey = key
      set({ editMode: true })
      return true
    }
    return false
  },

  deactivateEditMode: () => {
    _adminKey = null
    set({ editMode: false })
  },

  setMobileView: (view) => set({ mobileView: view }),

  // ── Progreso del paciente ─────────────────────────────────────────────────

  updateProgress: async (customerUuid, objectiveId, data, token) => {
    await micService.updateObjectiveProgress(customerUuid, objectiveId, data, token)
    await get().loadProgress(customerUuid, token)
  },

  // ── CRUD — helpers ────────────────────────────────────────────────────────

  addPillar: async (data) => {
    const key = requireAdminKey()
    await micService.createPillar(data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  editPillar: async (id, data) => {
    const key = requireAdminKey()
    await micService.updatePillar(id, data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  removePillar: async (id) => {
    const key = requireAdminKey()
    await micService.deletePillar(id, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  addPhase: async (pillarId, data) => {
    const key = requireAdminKey()
    await micService.createPhase(pillarId, data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  editPhase: async (id, data) => {
    const key = requireAdminKey()
    await micService.updatePhase(id, data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  removePhase: async (id) => {
    const key = requireAdminKey()
    await micService.deletePhase(id, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  addObjective: async (phaseId, data) => {
    const key = requireAdminKey()
    await micService.createObjective(phaseId, data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  editObjective: async (id, data) => {
    const key = requireAdminKey()
    await micService.updateObjective(id, data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  removeObjective: async (id) => {
    const key = requireAdminKey()
    await micService.deleteObjective(id, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  addItem: async (objectiveId, data) => {
    const key = requireAdminKey()
    await micService.createItem(objectiveId, data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  editItem: async (id, data) => {
    const key = requireAdminKey()
    await micService.updateItem(id, data, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },

  removeItem: async (id) => {
    const key = requireAdminKey()
    await micService.deleteItem(id, key)
    const { _customerUuid, _token } = get()
    if (_customerUuid && _token) await get().loadProgress(_customerUuid, _token)
  },
}))
