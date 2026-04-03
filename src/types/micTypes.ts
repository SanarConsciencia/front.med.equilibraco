// ============================================================
// ITEMS
// ============================================================

export interface MicItemCreate {
  name: string
  item_type: 'pdf' | 'mensaje_rapido' | 'guia' | 'otro'
  description?: string | null
  url?: string | null
  order?: number
}

/** Returned by CRUD endpoints (POST/PUT /items) */
export interface MicItemResponse {
  id: number
  objective_id: number
  name: string
  item_type: 'pdf' | 'mensaje_rapido' | 'guia' | 'otro'
  description: string | null
  url: string | null
  order: number
  created_at: string
}

// ============================================================
// OBJECTIVES
// ============================================================

export interface MicObjectiveCreate {
  name: string
  description?: string | null
  objective_type: 'teorico' | 'practico' | 'evaluativo'
  is_optional?: boolean
  is_intra?: boolean
  criteria?: string | null
  order?: number
}

/** Returned by CRUD endpoints (POST/PUT /objectives) */
export interface MicObjectiveResponse {
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
  created_at: string
  items: MicItemResponse[]
}

// ============================================================
// PHASES
// ============================================================

export interface MicPhaseCreate {
  name: string
  description?: string | null
  order?: number
}

/** Returned by CRUD endpoints (POST/PUT /phases) */
export interface MicPhaseResponse {
  id: number
  pillar_id: number
  name: string
  description: string | null
  order: number
  is_active: boolean
  created_at: string
  objectives: MicObjectiveResponse[]
}

// ============================================================
// PILLARS
// ============================================================

export interface MicPillarCreate {
  name: string
  description?: string | null
  order?: number
}

/** Returned by CRUD endpoints (GET/POST/PUT /pillars) */
export interface MicPillarResponse {
  id: number
  name: string
  description: string | null
  order: number
  is_active: boolean
  created_at: string
  updated_at: string | null
  phases: MicPhaseResponse[]
}

// ============================================================
// PROGRESS
// ============================================================

export interface MicProgressUpdate {
  completed: boolean
  notes?: string | null
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

// ============================================================
// VISTA DE PROGRESO DEL PACIENTE
// ============================================================

/** MicItem as returned inside the progress view */
export interface MicItem {
  id: number
  objective_id: number
  name: string
  item_type: 'pdf' | 'mensaje_rapido' | 'guia' | 'otro'
  description: string | null
  url: string | null
  order: number
  created_at: string
}

/** Shape of an objective inside MicPatientProgressResponse */
export interface MicObjectiveWithProgress {
  id: number
  name: string
  objective_type: 'teorico' | 'practico' | 'evaluativo'
  is_optional: boolean
  is_intra: boolean
  criteria: string | null
  order: number
  items: MicItem[]
  progress: MicProgressResponse | null
  // description is not returned by the progress endpoint but may be
  // used locally for edit-mode forms (will be undefined when absent)
  description?: string | null
}

/** Shape of a phase inside MicPatientProgressResponse */
export interface MicPhaseWithObjectives {
  id: number
  name: string
  order: number
  objectives: MicObjectiveWithProgress[]
}

/** Shape of a pillar inside MicPatientProgressResponse */
export interface MicPillarWithPhases {
  id: number
  name: string
  order: number
  phases: MicPhaseWithObjectives[]
}

export interface MicPatientProgressResponse {
  customer_id: string
  pillars: MicPillarWithPhases[]
}
