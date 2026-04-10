// ============================================================
// ENUMS
// ============================================================

export type EstadoCita =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "CANCELADA"
  | "REAGENDADA"
  | "NO_SHOW"
  | "COMPLETADA";

export type TipoBloqueo = "BLOQUEO" | "VACACIONES";

export type TipoAgenda = "ASISTENCIAL" | "DESCUBRIMIENTO";

// ============================================================
// AGENDA CONFIG — REDISEÑADO
// ============================================================

export interface RangoHorario {
  inicio: string; // "HH:MM"
  fin: string; // "HH:MM"
}

export interface AgendaConfigCreate {
  dia_semana: number;
  tipo: TipoAgenda;
  rangos: RangoHorario[];
  duracion_minutos: number;
  buffer_minutos: number;
  is_active: boolean;
}

export interface AgendaConfigResponse {
  id: number;
  medico_id: string;
  dia_semana: number;
  dia_nombre: string;
  tipo: TipoAgenda;
  rangos: RangoHorario[];
  duracion_minutos: number;
  buffer_minutos: number;
  is_active: boolean;
}

// Estado local de formulario para la UI
export interface DiaAgendaForm {
  dia_semana: number;
  dia_nombre: string;
  tipo: TipoAgenda;
  rangos: RangoHorario[];
  duracion_minutos: number;
  buffer_minutos: number;
  is_active: boolean;
  editando: boolean;
}

// ============================================================
// AGENDA BLOQUEOS
// ============================================================

export interface AgendaBloqueoResponse {
  id: number;
  medico_id: string;
  tipo: TipoBloqueo;
  motivo: string | null;
  fecha_inicio_colombia: string;
  fecha_fin_colombia: string;
}

export interface AgendaBloqueoCreate {
  tipo: TipoBloqueo;
  motivo?: string;
  fecha_inicio: string; // ISO sin tzinfo, hora Colombia: "2026-04-10T09:00"
  fecha_fin: string;
}

// ============================================================
// CITAS
// ============================================================

export interface CitaResponse {
  id: number;
  medico_id: string;
  customer_uuid: string | null;
  customer_email: string;
  customer_nombre: string;
  customer_phone: string | null;
  fecha_hora_inicio_colombia: string;
  fecha_hora_fin_colombia: string;
  duracion_minutos: number;
  tipo_cita: string;
  estado: EstadoCita;
  notas_paciente: string | null;
  notas_medico: string | null;
  token_cancelacion: string;
  cita_original_id: number | null;
  meet_link: string | null;
  created_at_colombia: string;
}

export interface CitaUpdateEstado {
  estado: EstadoCita;
  notas_medico?: string;
}

export interface CitaReagendar {
  fecha_hora_inicio: string;
  duracion_minutos: number;
}

// ============================================================
// SLOTS DISPONIBLES
// ============================================================

export interface SlotDisponible {
  inicio_colombia: string;
  fin_colombia: string;
  duracion_minutos: number;
}

export interface SlotsDisponiblesResponse {
  medico_id: string;
  fecha: string;
  duracion_minutos: number;
  slots: SlotDisponible[];
}

export interface DiaDisponibilidad {
  fecha: string;
  dia_semana: number;
  tiene_disponibilidad: boolean;
  slots_count: number;
}

export interface SemanaDisponibilidadResponse {
  medico_id: string;
  fecha_lunes: string;
  duracion_minutos: number;
  dias: DiaDisponibilidad[];
}

// ============================================================
// HELPERS UI
// ============================================================

export const DIAS_SEMANA: { dia_semana: number; dia_nombre: string }[] = [
  { dia_semana: 0, dia_nombre: "Lunes" },
  { dia_semana: 1, dia_nombre: "Martes" },
  { dia_semana: 2, dia_nombre: "Miércoles" },
  { dia_semana: 3, dia_nombre: "Jueves" },
  { dia_semana: 4, dia_nombre: "Viernes" },
  { dia_semana: 5, dia_nombre: "Sábado" },
  { dia_semana: 6, dia_nombre: "Domingo" },
];

export const DURACION_ASISTENCIAL_DEFAULT = 40;
export const DURACION_DESCUBRIMIENTO_DEFAULT = 40;
export const BUFFER_DESCUBRIMIENTO_DEFAULT = 20;

export const ESTADO_CITA_LABEL: Record<EstadoCita, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  REAGENDADA: "Reagendada",
  NO_SHOW: "No asistió",
  COMPLETADA: "Completada",
};

export const ESTADO_CITA_COLOR: Record<EstadoCita, string> = {
  PENDIENTE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  CONFIRMADA:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  CANCELADA: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  REAGENDADA:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  COMPLETADA:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export const TRANSICIONES_MEDICO: Record<EstadoCita, EstadoCita[]> = {
  PENDIENTE: ["CONFIRMADA", "CANCELADA"],
  CONFIRMADA: ["COMPLETADA", "NO_SHOW", "CANCELADA"],
  CANCELADA: [],
  COMPLETADA: [],
  NO_SHOW: [],
  REAGENDADA: [],
};

// ============================================================
// EVALUACIÓN PRE-CONSULTA
// ============================================================

export type PerfilPaciente = "PRIORITARIO" | "COMPROMETIDO" | "EXPLORADOR";

export interface RespuestaEvaluacion {
  pregunta: string;
  respuesta: string;
}

export interface EvaluacionPreConsulta {
  cita_id: number;
  perfil: PerfilPaciente;
  respuestas: RespuestaEvaluacion[];
}

export const PERFIL_BADGE_COLOR: Record<PerfilPaciente, string> = {
  PRIORITARIO: "#446812",
  COMPROMETIDO: "#75a825",
  EXPLORADOR: "#94a3b8",
};

export function formatFechaCita(isoString: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export function formatHora(isoString: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export function formatFechaCorta(isoString: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(isoString));
}

export function dateToColombiaISO(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .format(date)
    .replace(" ", "T")
    .substring(0, 16);
}

export function todayColombia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(new Date());
}
