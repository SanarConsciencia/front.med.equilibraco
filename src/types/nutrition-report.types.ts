// src/types/nutrition-report.types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tipos del payload que el front construye y envía a kiwi-pdf.
// POST /reports/nutrition
//
// El front transforma todas las fuentes de datos y kiwi-pdf
// solo valida, descarga fotos, genera gráficas y renderiza.
// ─────────────────────────────────────────────────────────────────────────────

// ============================================================================
// ENTIDADES BASE
// ============================================================================

export interface ReportDoctor {
  nombre_completo: string;
  especialidad: string | null;
  tarjeta_profesional: string;
  email: string;
}

export interface ReportPatient {
  nombre: string;
  email: string;
  subscription_status: string;
  avatar_url: string | null;
}

// ============================================================================
// RESUMEN EJECUTIVO
// ============================================================================

export interface WeeklyScorePoint {
  date: string; // YYYY-MM-DD
  overall_score: number | null;
  inflamitis_score: number | null;
}

export interface ReportSummary {
  // Scores del día actual
  overall_score: number; // compliance.overall
  inflamitis_score: number | null;
  inflamitis_interpretation: string | null;
  meals_count: number;
  ingredients_count: number;

  // Contexto semanal — calculado en el front con la API de scores
  weekly_overall_avg: number | null;
  weekly_inflamitis_avg: number | null;
  // Positivo = el día fue mejor que el promedio semanal
  delta_vs_weekly_avg: number | null;
  // Serie de 7 días para las gráficas del PDF
  weekly_scores: WeeklyScorePoint[];
}

// ============================================================================
// NUTRIENTES — estructura por grupo
// ============================================================================

export interface ReportSubNutrient {
  key: string; // "proteins_g", "calcium", etc.
  label: string; // "Proteínas totales", "Calcio"
  required: number | null; // null en bioactivos
  consumed: number;
  compliance_pct: number | null; // null en bioactivos
  unit: string; // "g", "mg", "μg", "IU"
}

export interface ReportTopFood {
  food_name: string;
  contribution: number;
  unit: string;
  percentage_of_total: number; // 0-100
}

export interface ReportMealBreakdown {
  meal_name: string;
  meal_time: string | null;
  contribution: number;
  unit: string;
  percentage_of_total: number; // 0-100
}

// InsightItem simplificado para incluir en el payload.
// Refleja InsightItem de insight_schemas.py.
export interface ReportInsightItem {
  priority: number; // 1-6
  insight_type: string;
  nutrient: string | null;
  nutrient_label: string | null;
  days_count: number;
  avg_compliance: number | null;
  severity: "critical" | "high" | "medium" | "low" | "borderline";
  headline: string;
  body: string;
  symptom_connection: string;
  has_user_signal: boolean;
}

export type NutrientGroupKey =
  | "proteins"
  | "carbs"
  | "fats"
  | "minerals"
  | "vitamins"
  | "bioactives";

export interface ReportNutrientGroup {
  group: NutrientGroupKey;
  group_label: string;
  // Promedio de cumplimiento de sub-nutrientes con compliance.
  // null para bioactivos (no tienen requerimiento definido).
  group_score: number | null;
  sub_nutrients: ReportSubNutrient[];
  // Top 5 ingredientes por contribución al grupo principal
  top_foods: ReportTopFood[];
  // Aporte al grupo desglosado por plato del día
  meal_breakdown: ReportMealBreakdown[];
  // Insight semanal si existe para algún nutriente del grupo
  weekly_insight: ReportInsightItem | null;
  // Alerta de prioridad alta (1-2) si existe para el grupo
  alert: ReportInsightItem | null;
}

// ============================================================================
// ESTADO INFLAMATORIO
// ============================================================================

export interface ReportInflammatory {
  inflamitis_score: number | null;
  inflamitis_interpretation: string | null;
  nova_count: {
    nova_1: number;
    nova_2: number;
    nova_3: number;
    nova_4: number;
  };
  drivers_increase: string[];
  drivers_decrease: string[];
  recommendations: string[];
  probiotic_count: number;
  prebiotic_count: number;
  omega_6_3_ratio: string | null;
}

// ============================================================================
// PLATOS DEL DÍA
// ============================================================================

export interface ReportIngredient {
  food_name: string;
  quantity: number;
  unit: string;
}

export interface ReportMeal {
  meal_name: string;
  meal_time: string | null;
  meal_type: "main" | "periworkout" | "extra";
  ingredients: ReportIngredient[];
  // URLs públicas de Supabase — kiwi-pdf las descarga como base64
  photos: string[];
  user_note: string | null;
  doctor_note: string | null;
}

// ============================================================================
// RETROALIMENTACIÓN MÉDICA (opcional)
// ============================================================================

export interface ReportMedicalFeedback {
  contenido: string;
  score_general: number | null;
  created_at: string; // ISO datetime
}

// ============================================================================
// PAYLOAD COMPLETO
// ============================================================================

export interface NutritionReportPayload {
  doctor: ReportDoctor;
  patient: ReportPatient;
  report_date: string; // YYYY-MM-DD
  summary: ReportSummary;
  nutrients: ReportNutrientGroup[];
  inflammatory: ReportInflammatory;
  meals: ReportMeal[];
  medical_feedback: ReportMedicalFeedback | null;
}

// ============================================================================
// CONFIGURACIÓN DE GRUPOS DE NUTRIENTES
// ============================================================================
// Define qué claves del DayAnalysisResponse pertenecen a cada grupo,
// su etiqueta legible y su unidad de medida.

export interface NutrientConfig {
  key: string;
  label: string;
  unit: string;
}

export const NUTRIENT_GROUPS: Record<
  NutrientGroupKey,
  { label: string; nutrients: NutrientConfig[] }
> = {
  proteins: {
    label: "Proteínas",
    nutrients: [
      { key: "proteins_g", label: "Proteínas totales", unit: "g" },
    ],
  },

  carbs: {
    label: "Carbohidratos",
    nutrients: [
      {
        key: "carbs_g",
        label: "Carbohidratos totales",
        unit: "g",
      },
      { key: "starches_g", label: "Almidones", unit: "g" },
      { key: "sugars_g", label: "Azúcares", unit: "g" },
      { key: "fiber_g", label: "Fibra total", unit: "g" },
      { key: "fiber_soluble_g", label: "Fibra soluble", unit: "g" },
      {
        key: "fiber_insoluble_g",
        label: "Fibra insoluble",
        unit: "g",
      },
    ],
  },

  fats: {
    label: "Grasas",
    nutrients: [
      { key: "fats_g", label: "Grasas totales", unit: "g" },
      {
        key: "mufa_g",
        label: "Grasas monoinsaturadas",
        unit: "g",
      },
      {
        key: "pufa_g",
        label: "Grasas poliinsaturadas",
        unit: "g",
      },
      { key: "sfa_g", label: "Grasas saturadas", unit: "g" },
      { key: "omega_3_ala_g", label: "Omega-3 ALA", unit: "g" },
      {
        key: "omega_3_epa_dha_mg",
        label: "Omega-3 EPA+DHA",
        unit: "mg",
      },
      { key: "omega_6_la_g", label: "Omega-6 LA", unit: "g" },
    ],
  },

  minerals: {
    label: "Minerales",
    nutrients: [
      { key: "calcium", label: "Calcio", unit: "mg" },
      { key: "iron", label: "Hierro", unit: "mg" },
      { key: "magnesium", label: "Magnesio", unit: "mg" },
      { key: "zinc", label: "Zinc", unit: "mg" },
      { key: "potassium", label: "Potasio", unit: "mg" },
      { key: "sodium", label: "Sodio", unit: "mg" },
    ],
  },

  vitamins: {
    label: "Vitaminas",
    nutrients: [
      { key: "vitamin_c", label: "Vitamina C", unit: "mg" },
      { key: "vitamin_d", label: "Vitamina D", unit: "IU" },
      { key: "vitamin_b1", label: "Vitamina B1", unit: "μg" },
      { key: "vitamin_b2", label: "Vitamina B2", unit: "μg" },
      { key: "vitamin_b6", label: "Vitamina B6", unit: "μg" },
      { key: "vitamin_b12", label: "Vitamina B12", unit: "μg" },
      { key: "folate", label: "Folato", unit: "μg" },
    ],
  },

  bioactives: {
    label: "Bioactivos",
    nutrients: [
      { key: "garlic_g", label: "Ajo", unit: "g" },
      { key: "turmeric_g", label: "Cúrcuma", unit: "g" },
      { key: "ginger_g", label: "Jengibre", unit: "g" },
      { key: "onion_g", label: "Cebolla", unit: "g" },
      { key: "pepper_g", label: "Pimienta", unit: "g" },
      { key: "thyme_g", label: "Tomillo", unit: "g" },
      { key: "oregano_g", label: "Orégano", unit: "g" },
      { key: "rosemary_g", label: "Romero", unit: "g" },
      { key: "tea_g", label: "Té", unit: "g" },
      {
        key: "anthocyanidins_mg",
        label: "Antocianidinas",
        unit: "mg",
      },
      {
        key: "flavan3ols_mg",
        label: "Flavan-3-oles",
        unit: "mg",
      },
      { key: "flavones_mg", label: "Flavonas", unit: "mg" },
      { key: "flavonols_mg", label: "Flavonoles", unit: "mg" },
      { key: "flavanones_mg", label: "Flavanonas", unit: "mg" },
      { key: "isoflavones_mg", label: "Isoflavonas", unit: "mg" },
      {
        key: "beta_carotene_mcg",
        label: "Beta-caroteno",
        unit: "μg",
      },
    ],
  },
};

// ============================================================================
// MAPA DE INSIGHTS → GRUPOS
// ============================================================================
// Permite asignar cada InsightItem (por su campo nutrient)
// al NutrientGroup correcto al construir el payload.

export const INSIGHT_KEY_TO_GROUP: Record<string, NutrientGroupKey> =
  {
    // Proteínas
    proteins_g: "proteins",

    // Carbohidratos
    carbs_g: "carbs",
    starches_g: "carbs",
    sugars_g: "carbs",
    fiber_g: "carbs",
    fiber_soluble_g: "carbs",
    fiber_insoluble_g: "carbs",

    // Grasas
    fats_g: "fats",
    mufa_g: "fats",
    pufa_g: "fats",
    sfa_g: "fats",
    omega_3_ala_g: "fats",
    omega_3_epa_dha_mg: "fats",
    omega_6_la_g: "fats",

    // Minerales
    calcium: "minerals",
    iron: "minerals",
    magnesium: "minerals",
    zinc: "minerals",
    potassium: "minerals",
    sodium: "minerals",

    // Vitaminas
    vitamin_c: "vitamins",
    vitamin_d: "vitamins",
    vitamin_b1: "vitamins",
    vitamin_b2: "vitamins",
    vitamin_b6: "vitamins",
    vitamin_b12: "vitamins",
    folate: "vitamins",
  };