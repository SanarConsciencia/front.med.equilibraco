export interface MicItem {
  id: number
  objective_id: number
  name: string
  item_type: 'pdf' | 'mensaje_rapido' | 'guia' | 'otro'
  description: string | null
  url: string | null
  order: number
}

export interface MicProgressResponse {
  id: number
  customer_id: string
  objective_id: number
  medico_id: string
  completed: boolean
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export interface MicObjectiveWithProgress {
  id: number
  phase_id: number
  name: string
  description: string | null
  objective_type: 'teorico' | 'practico' | 'evaluativo'
  is_optional: boolean
  is_intra: boolean
  criteria: string | null
  order: number
  is_active: boolean
  items: MicItem[]
  progress: MicProgressResponse | null
}

export interface MicPhaseWithObjectives {
  id: number
  pillar_id: number
  name: string
  description: string | null
  order: number
  is_active: boolean
  objectives: MicObjectiveWithProgress[]
}

export interface MicPillarWithPhases {
  id: number
  name: string
  description: string | null
  order: number
  is_active: boolean
  phases: MicPhaseWithObjectives[]
}

export interface MicPatientProgressResponse {
  pillars: MicPillarWithPhases[]
}

// CRUD types — sistema global
export interface MicPillarCreate {
  name: string
  description?: string | null
  order?: number
  is_active?: boolean
}

export interface MicPhaseCreate {
  name: string
  description?: string | null
  order?: number
  is_active?: boolean
}

export interface MicObjectiveCreate {
  name: string
  description?: string | null
  objective_type: 'teorico' | 'practico' | 'evaluativo'
  is_optional?: boolean
  is_intra?: boolean
  criteria?: string | null
  order?: number
  is_active?: boolean
}

export interface MicItemCreate {
  name: string
  item_type: 'pdf' | 'mensaje_rapido' | 'guia' | 'otro'
  description?: string | null
  url?: string | null
  order?: number
}

export interface MicProgressUpdate {
  completed: boolean
  notes?: string | null
}
