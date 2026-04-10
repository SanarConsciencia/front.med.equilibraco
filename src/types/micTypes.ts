// ============================================================
// ITEMS
// ============================================================

export interface MicItemCreate {
  name: string;
  item_type:
    | "guia"
    | "mensaje_rapido"
    | "pdf_educativo"
    | "contenido_social"
    | "video_educativo"
    | "protocolo"
    | "checklist"
    | "receta";
  description?: string | null;
  url?: string | null;
  order?: number;
}

/** Returned by CRUD endpoints (POST/PUT /items) */
export interface MicItemResponse {
  id: number;
  objective_id: number;
  name: string;
  item_type:
    | "guia"
    | "mensaje_rapido"
    | "pdf_educativo"
    | "contenido_social"
    | "video_educativo"
    | "protocolo"
    | "checklist"
    | "receta";
  description: string | null;
  url: string | null;
  order: number;
  created_at: string;
}

// ============================================================
// OBJECTIVES
// ============================================================

export interface MicObjectiveCreate {
  name: string;
  description?: string | null;
  objective_type: "teorico" | "practico" | "evaluativo";
  is_optional?: boolean;
  is_intra?: boolean;
  criteria?: string | null;
  order?: number;
}

/** Returned by CRUD endpoints (POST/PUT /objectives) */
export interface MicObjectiveResponse {
  id: number;
  phase_id: number;
  name: string;
  description: string | null;
  objective_type: "teorico" | "practico" | "evaluativo";
  is_optional: boolean;
  is_intra: boolean;
  criteria: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  items: MicItemResponse[];
}

// ============================================================
// PHASES
// ============================================================

export interface MicPhaseCreate {
  name: string;
  description?: string | null;
  order?: number;
}

/** Returned by CRUD endpoints (POST/PUT /phases) */
export interface MicPhaseResponse {
  id: number;
  pillar_id: number;
  name: string;
  description: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  objectives: MicObjectiveResponse[];
}

// ============================================================
// PILLARS
// ============================================================

export interface MicPillarCreate {
  name: string;
  description?: string | null;
  order?: number;
}

/** Returned by CRUD endpoints (GET/POST/PUT /pillars) */
export interface MicPillarResponse {
  id: number;
  name: string;
  description: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  phases: MicPhaseResponse[];
}

// ============================================================
// PROGRESS
// ============================================================

export type MicProgressStatus =
  | "pending"
  | "en_curso"
  | "finalizada"
  | "abandonada";

export interface MicProgressUpdate {
  completed: boolean;
  notes?: string | null;
  status: MicProgressStatus;
}

export interface MicProgressResponse {
  id: number;
  customer_id: string;
  objective_id: number;
  medico_id: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  status: MicProgressStatus;
  created_at: string;
  updated_at: string | null;
}

// ============================================================
// VISTA DE PROGRESO DEL PACIENTE
// ============================================================

/** MicItem as returned inside the progress view */
export interface MicItem {
  id: number;
  objective_id: number;
  name: string;
  item_type:
    | "guia"
    | "mensaje_rapido"
    | "pdf_educativo"
    | "contenido_social"
    | "video_educativo"
    | "protocolo"
    | "checklist"
    | "receta";
  description: string | null;
  url: string | null;
  order: number;
  created_at: string;
}

/** Shape of an objective inside MicPatientProgressResponse */
export interface MicObjectiveWithProgress {
  id: number;
  name: string;
  objective_type: "teorico" | "practico" | "evaluativo";
  is_optional: boolean;
  is_intra: boolean;
  criteria: string | null;
  order: number;
  items: MicItem[];
  progress: MicProgressResponse | null;
  // description is not returned by the progress endpoint but may be
  // used locally for edit-mode forms (will be undefined when absent)
  description?: string | null;
}

/** Shape of a phase inside MicPatientProgressResponse */
export interface MicPhaseWithObjectives {
  id: number;
  name: string;
  order: number;
  objectives: MicObjectiveWithProgress[];
}

/** Shape of a pillar inside MicPatientProgressResponse */
export interface MicPillarWithPhases {
  id: number;
  name: string;
  order: number;
  phases: MicPhaseWithObjectives[];
}

export interface MicPatientProgressResponse {
  customer_id: string;
  pillars: MicPillarWithPhases[];
}

// ============================================================
// SNAPSHOTS DE SCORES Y CUMPLIMIENTO
// ============================================================

export interface DaySnapshot {
  day_id: number;
  date: string; // YYYY-MM-DD
  // Puntajes globales
  overall_score: number | null;
  inflamitis_score: number | null;
  day_dii: number | null;
  net_inflamatory_score: number | null;
  // Macros
  proteins_pct: number | null;
  carbs_pct: number | null;
  starches_pct: number | null;
  sugars_pct: number | null;
  fats_pct: number | null;
  saturated_fats_pct: number | null;
  monounsaturated_fats_pct: number | null;
  polyunsaturated_fats_pct: number | null;
  fiber_pct: number | null;
  // Minerales
  calcium_pct: number | null;
  iron_pct: number | null;
  magnesium_pct: number | null;
  zinc_pct: number | null;
  potassium_pct: number | null;
  phosphorus_pct: number | null;
  sodium_pct: number | null;
  // Vitaminas
  vitamin_c_pct: number | null;
  vitamin_d_pct: number | null;
  vitamin_a_pct: number | null;
  vitamin_e_pct: number | null;
  vitamin_b12_pct: number | null;
  vitamin_b6_pct: number | null;
  folate_pct: number | null;
  thiamine_pct: number | null;
  riboflavin_pct: number | null;
  niacin_pct: number | null;
  // Otros
  [key: string]: number | string | null | undefined;
}

export interface SnapshotsResponse {
  customer_id: string;
  snapshots: DaySnapshot[];
}

// ============================================================
// PROTOCOLS
// ============================================================

export interface MicProtocol {
  id: number;
  name: string;
  protocol_type: "universal" | "pilar_especifico";
  applies_to: string[];
  trigger: string;
  description: string | null;
  content: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface MicProtocolActivation {
  id: number;
  protocol_id: number;
  customer_id: string;
  medico_id: string;
  notes: string | null;
  activated_at: string;
  protocol: MicProtocol;
}

export interface MicProtocolActivationCreate {
  notes?: string | null;
}
