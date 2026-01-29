// Types para Meal Analysis By Slot
// Equivalentes TypeScript de los schemas Pydantic de Python (meal_analysis_by_slot_schemas.py)

// ═══════════════════════════════════════════════════════════
// SLOT ANALYSIS TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Metadata de un slot del periodo
 */
export interface SlotMetadata {
  slot_id: string; // e.g., "main_1", "peri_pre", "extra_morning"
  total_occurrences: number; // >= 0
  days_present: number; // >= 0
  days_missing: number; // >= 0
  consistency_score: number; // 0-100
}

/**
 * Propiedades de un alimento
 */
export interface FoodProperties {
  inflammatory_score?: number;
  is_probiotic?: boolean;
  is_prebiotic?: boolean;
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  nova_classification?: number;
  [key: string]: any; // Para propiedades adicionales
}

/**
 * Resumen de un ingrediente en el slot
 */
export interface IngredientSummary {
  food_id: number;
  food_name: string;
  frequency: number; // >= 1
  frequency_pct: number; // 0-100
  avg_weight_g: number; // >= 0
  std_weight_g: number; // >= 0
  cv_weight: number; // >= 0, coeficiente de variación
  avg_nutritional_contribution: Record<string, number>; // e.g., { proteins_g: 18.5, carbs_g: 1.2 }
  properties: FoodProperties;
}

/**
 * Análisis de ingredientes del slot
 */
export interface IngredientsAnalysis {
  total_unique_ingredients: number; // >= 0
  core_ingredients: IngredientSummary[]; // >70% frecuencia
  common_ingredients: IngredientSummary[]; // 40-70% frecuencia
  occasional_ingredients: IngredientSummary[]; // <40% frecuencia
}

/**
 * Perfil nutricional del slot
 */
export interface NutritionalProfile {
  average: Record<string, number>; // Valores promedio por nutriente
  std_dev: Record<string, number>; // Desviación estándar
  coefficient_variation: Record<string, number>; // CV (%)
  min: Record<string, number>; // Valores mínimos
  max: Record<string, number>; // Valores máximos
}

/**
 * Información de un día típico o atípico
 */
export interface DayInfo {
  day_id: number;
  date: string; // YYYY-MM-DD
  totals: Record<string, number>; // Totales nutricionales
  z_scores: Record<string, number>; // Z-scores de nutrientes clave
  max_z_score: number; // Z-score máximo (en valor absoluto)
  reason: string; // Razón de clasificación
  unusual_ingredients?: string[]; // Solo en días atípicos
}

/**
 * Análisis temporal: días típicos y atípicos
 */
export interface TemporalAnalysis {
  typical_days: DayInfo[]; // Top 5 más típicos
  atypical_days: DayInfo[]; // Top 5 más atípicos
}

/**
 * Distribución de macronutrientes
 */
export interface MacroDistribution {
  protein_pct: number; // 0-100
  carb_pct: number; // 0-100
  fat_pct: number; // 0-100
}

/**
 * Perfil inflamatorio del slot
 */
export interface InflammatoryProfile {
  avg_dii: number | null; // DII promedio (null si no hay datos)
  dii_available: boolean; // Si hay datos DII
  days_anti_inflammatory: number; // >= 0, días con DII < -1
  days_pro_inflammatory: number; // >= 0, días con DII > 1
  days_neutral: number; // >= 0, días con -1 <= DII <= 1
}

/**
 * Categorización del slot
 */
export interface SlotCategorization {
  primary_category: string; // "Alto en proteína", "Balanceado", etc.
  secondary_traits: string[]; // ["Bajo en fibra", "Muy consistente", etc.]
  consistency_score: number; // 0-100
  balance_score: number; // 0-100
  macro_distribution: MacroDistribution;
  inflammatory_profile: InflammatoryProfile;
}

/**
 * Compliance de un nutriente específico
 */
export interface NutrientCompliance {
  avg: number; // >= 0, compliance promedio (%)
  days_above_80: number; // >= 0
  days_below_50: number; // >= 0
  trend: "improving" | "declining" | "stable";
}

/**
 * Mejor/peor día de compliance
 */
export interface BestWorstDay {
  day_id: number;
  date: string; // YYYY-MM-DD
  compliance: number; // >= 0 (%)
}

/**
 * Análisis de compliance del slot
 */
export interface ComplianceAnalysis {
  available: boolean; // Solo true si hay pattern
  avg_compliance?: number; // >= 0 (%)
  compliance_by_nutrient?: Record<string, NutrientCompliance>;
  best_compliance_day?: BestWorstDay;
  worst_compliance_day?: BestWorstDay;
}

/**
 * Ingrediente que contribuye significativamente
 */
export interface KeyContributor {
  ingredient: string;
  food_id: number;
  contributes_to: string[]; // Lista de nutrientes (>20%)
  contribution_pct: Record<string, number>; // % por nutriente
}

/**
 * Sugerencia de ajuste de ingrediente
 */
export interface SuggestedAdjustment {
  priority: "high" | "medium" | "low";
  action: "increase" | "decrease" | "add" | "remove";
  ingredient: string;
  from_g?: number; // Peso actual (si aplica)
  to_g?: number; // Peso sugerido (si aplica)
  suggested_g?: number; // Peso sugerido para nuevos ingredientes
  expected_impact: Record<string, string>; // e.g., { fiber_g: "+2.1", compliance_improvement: "+8%" }
  reason: string;
}

/**
 * Sugerencia de ingrediente alternativo
 */
export interface AlternativeIngredient {
  suggestion: string; // Descripción de la sugerencia
  examples: string; // Ejemplos de swaps
  reason: string; // Razón del swap
  expected_impact: Record<string, string>; // Impacto esperado
}

/**
 * Optimización de ingredientes del slot
 */
export interface IngredientOptimization {
  key_contributors: KeyContributor[]; // Ingredientes clave (>20% aporte)
  suggested_adjustments: SuggestedAdjustment[]; // Top 5 ajustes
  alternative_ingredients: AlternativeIngredient[]; // Top 3 alternativas
}

/**
 * Recomendación SMART para el slot
 */
export interface SlotRecommendation {
  priority: "high" | "medium" | "low";
  category: string; // "compliance", "fibra", "balance", "inflamacion", etc.
  message: string; // Mensaje con acción específica
  actionable: boolean; // Si es accionable
}

/**
 * Análisis completo de un slot
 */
export interface SlotAnalysis {
  metadata: SlotMetadata;
  ingredients_analysis: IngredientsAnalysis;
  nutritional_profile: NutritionalProfile;
  temporal_analysis: TemporalAnalysis;
  categorization: SlotCategorization;
  compliance_analysis: ComplianceAnalysis;
  ingredient_optimization: IngredientOptimization;
  recommendations: SlotRecommendation[]; // Clasificadas por prioridad
}

/**
 * Slot que necesita atención
 */
export interface SlotNeedingAttention {
  slot_id: string;
  reasons: string[]; // Razones por las que necesita atención
  priority: "high" | "medium" | "low";
}

/**
 * Resumen del periodo (para análisis por slot)
 */
export interface SlotPeriodSummary {
  most_consistent_slot: string | null;
  most_variable_slot: string | null;
  best_balanced_slot: string | null;
  best_compliance_slot: string | null; // Solo si hay datos de compliance
  slots_needing_attention: SlotNeedingAttention[]; // Ordenados por prioridad
  overall_pattern_adherence: number; // 0-100 (%)
  total_slots_analyzed: number; // >= 0
  slots_with_compliance: number; // >= 0
}

/**
 * Análisis de platos organizados por slot
 * 
 * NUEVO: Reemplaza MealAnalysis
 * Organiza el análisis por slot (main_1, main_2, etc.) en lugar de por platos individuales
 */
export interface MealAnalysisBySlot {
  slots_analyzed: string[]; // e.g., ["main_1", "main_2", "peri_pre", "extra_morning"]
  slot_analysis: Record<string, SlotAnalysis>; // Análisis por cada slot
  period_summary: SlotPeriodSummary;
  message?: string | null; // Mensaje cuando no hay datos
}